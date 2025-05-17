
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetsTable } from "@/components/dashboard/AssetsTable";
import { AssetType } from "@/types";
import { AssetWithPrice } from "@/types";

interface AssetTabsProps {
  activeTab: AssetType;
  setActiveTab: (value: AssetType) => void;
  assetsWithPrices: AssetWithPrice[];
  isLoading: boolean;
}

export function AssetTabs({
  activeTab,
  setActiveTab,
  assetsWithPrices,
  isLoading,
}: AssetTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AssetType)}>
      <TabsList className="mb-6">
        <TabsTrigger value="stock">Stocks</TabsTrigger>
        <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stock">
        <AssetsTable 
          assets={assetsWithPrices} 
          isLoading={isLoading} 
          assetType="stock" 
        />
      </TabsContent>
      
      <TabsContent value="crypto">
        <AssetsTable 
          assets={assetsWithPrices} 
          isLoading={isLoading} 
          assetType="crypto" 
        />
      </TabsContent>
    </Tabs>
  );
}
