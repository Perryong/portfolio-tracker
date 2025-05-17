
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Asset, AssetType } from "@/types";
import { generateId } from "@/lib/utils";
import { databaseService } from "@/services/databaseService";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioState {
  assets: Asset[];
  isLoading: boolean;
  isSynced: boolean;
  addAsset: (asset: Omit<Asset, "id">) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  getAssetsByType: (type: AssetType) => Asset[];
  clearAll: () => void;
  loadAssetsFromDatabase: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      assets: [],
      isLoading: false,
      isSynced: false,
      
      addAsset: async (asset) => {
        const { data: session } = await supabase.auth.getSession();
        const isLoggedIn = !!session?.session;
        
        if (isLoggedIn) {
          // User is logged in, add to database
          set({ isLoading: true });
          const newAsset = await databaseService.addAsset(asset);
          
          if (newAsset) {
            set({ isLoading: false });
            // Asset will be added through real-time subscription
          } else {
            set({ isLoading: false });
          }
        } else {
          // User is not logged in, add to local storage
          const id = generateId();
          set((state) => ({ 
            assets: [...state.assets, { ...asset, id }] 
          }));
        }
      },
      
      updateAsset: async (id, updates) => {
        const { data: session } = await supabase.auth.getSession();
        const isLoggedIn = !!session?.session;
        
        if (isLoggedIn) {
          // User is logged in, update in database
          set({ isLoading: true });
          const success = await databaseService.updateAsset(id, updates);
          
          if (success) {
            set({ isLoading: false });
            // Asset will be updated through real-time subscription
          } else {
            set({ isLoading: false });
          }
        } else {
          // User is not logged in, update in local storage
          set((state) => ({
            assets: state.assets.map((asset) => 
              asset.id === id ? { ...asset, ...updates } : asset
            ),
          }));
        }
      },
      
      removeAsset: async (id) => {
        const { data: session } = await supabase.auth.getSession();
        const isLoggedIn = !!session?.session;
        
        if (isLoggedIn) {
          // User is logged in, remove from database
          set({ isLoading: true });
          const success = await databaseService.removeAsset(id);
          
          if (success) {
            set({ isLoading: false });
            // Asset will be removed through real-time subscription
          } else {
            set({ isLoading: false });
          }
        } else {
          // User is not logged in, remove from local storage
          set((state) => ({
            assets: state.assets.filter((asset) => asset.id !== id),
          }));
        }
      },
      
      getAssetsByType: (type) => {
        return get().assets.filter((asset) => asset.type === type);
      },
      
      clearAll: () => set({ assets: [] }),
      
      loadAssetsFromDatabase: async () => {
        const { data: session } = await supabase.auth.getSession();
        const isLoggedIn = !!session?.session;
        
        if (isLoggedIn) {
          set({ isLoading: true });
          const assets = await databaseService.getAssets();
          set({ assets, isLoading: false, isSynced: true });
          
          // Set up real-time subscription
          const unsubscribe = databaseService.subscribeToAssets((assets) => {
            set({ assets });
          });
          
          // Clean up subscription when store is destroyed
          // This might not work as expected, but we don't have a good way to
          // clean up with zustand + persist. Consider using a separate hook for this.
        }
      }
    }),
    {
      name: "portfolio-storage",
    }
  )
);

// Initialize database connection and load assets when authenticated
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Wait a tick to avoid supabase auth deadlock
    setTimeout(() => {
      usePortfolioStore.getState().loadAssetsFromDatabase();
    }, 0);
  } else if (event === 'SIGNED_OUT') {
    usePortfolioStore.getState().clearAll();
  }
});
