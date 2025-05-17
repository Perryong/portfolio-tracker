
import { supabase } from "@/integrations/supabase/client";
import { Asset, AssetType } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to handle database operations for portfolio assets
 */
export const databaseService = {
  /**
   * Get all assets for the current user
   */
  async getAssets(): Promise<Asset[]> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      // Return empty array if not logged in - will use local storage instead
      return [];
    }
    
    const { data, error } = await supabase
      .from('assets')
      .select('*');
      
    if (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load portfolio data');
      return [];
    }
    
    return data.map(asset => ({
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type as AssetType, // Cast string to AssetType
      quantity: Number(asset.quantity),
      avgCost: asset.avg_cost ? Number(asset.avg_cost) : undefined
    }));
  },
  
  /**
   * Add a new asset to the database
   */
  async addAsset(asset: Omit<Asset, "id">): Promise<Asset | null> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      // Not authenticated, return null
      toast.error('You need to be logged in to save assets');
      return null;
    }
    
    // Generate a proper UUID v4 compatible with Supabase
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('assets')
      .insert({
        id,
        ticker: asset.ticker,
        name: asset.name,
        type: asset.type,
        quantity: asset.quantity,
        avg_cost: asset.avgCost,
        user_id: session.session.user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to save asset');
      return null;
    }
    
    return {
      id: data.id,
      ticker: data.ticker,
      name: data.name,
      type: data.type as AssetType, // Cast string to AssetType
      quantity: Number(data.quantity),
      avgCost: data.avg_cost ? Number(data.avg_cost) : undefined
    };
  },
  
  /**
   * Update an existing asset
   */
  async updateAsset(id: string, updates: Partial<Asset>): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      toast.error('You need to be logged in to update assets');
      return false;
    }
    
    const { error } = await supabase
      .from('assets')
      .update({
        ticker: updates.ticker,
        name: updates.name,
        quantity: updates.quantity,
        avg_cost: updates.avgCost
      })
      .eq('id', id)
      .eq('user_id', session.session.user.id);
      
    if (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
      return false;
    }
    
    return true;
  },
  
  /**
   * Remove an asset from the database
   */
  async removeAsset(id: string): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      toast.error('You need to be logged in to remove assets');
      return false;
    }
    
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', session.session.user.id);
      
    if (error) {
      console.error('Error removing asset:', error);
      toast.error('Failed to remove asset');
      return false;
    }
    
    return true;
  },
  
  /**
   * Migrate assets from local storage to database
   */
  async migrateAssetsToDatabase(assets: Asset[]): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      toast.error('You need to be logged in to migrate assets');
      return false;
    }
    
    // Prepare assets for insertion with user_id and new UUIDs
    const assetsToInsert = assets.map(asset => ({
      id: uuidv4(), // Generate new UUID for each asset
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      quantity: asset.quantity,
      avg_cost: asset.avgCost,
      user_id: session.session.user.id
    }));
    
    if (assetsToInsert.length === 0) {
      return true;
    }
    
    const { error } = await supabase
      .from('assets')
      .insert(assetsToInsert);
      
    if (error) {
      console.error('Error migrating assets:', error);
      toast.error('Failed to migrate portfolio data');
      return false;
    }
    
    toast.success('Successfully migrated portfolio data');
    return true;
  },
  
  /**
   * Subscribe to real-time updates for the user's assets
   */
  subscribeToAssets(callback: (assets: Asset[]) => void): () => void {
    // Subscribe to changes on the assets table
    const channel = supabase
      .channel('asset-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        async (payload) => {
          // When there's a change, fetch all assets again
          const assets = await databaseService.getAssets();
          callback(assets);
        }
      )
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
};
