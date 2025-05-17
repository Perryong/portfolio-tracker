
import { useState, useEffect } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AssetWithPrice, AssetType } from "@/types";
import { usePortfolioStore } from "@/store/portfolioStore";
import { AddAssetDialog } from "@/components/dashboard/AddAssetDialog";
import { AssetsTableHeader } from "./TableHeader";
import { AssetRow } from "./AssetRow";
import { LoadingTable } from "./LoadingTable";
import { EmptyTable } from "./EmptyTable";
import { useSortableAssets } from "./useSortableAssets";

interface AssetsTableProps {
  assets: AssetWithPrice[];
  isLoading: boolean;
  assetType: AssetType;
}

export function AssetsTable({ assets, isLoading, assetType }: AssetsTableProps) {
  const { updateAsset, removeAsset } = usePortfolioStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const { sortedAssets, sortField, sortDirection, handleSort } = useSortableAssets(assets);

  // Loading state placeholders
  if (isLoading) {
    return <LoadingTable assetType={assetType} />;
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <>
        <EmptyTable 
          assetType={assetType} 
          onAddAsset={() => setIsAddDialogOpen(true)} 
        />
        <AddAssetDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          assetType={assetType} 
        />
      </>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="p-4 flex justify-between">
        <h2 className="text-lg font-semibold">
          {assetType === "stock" ? "Stocks" : "Cryptocurrencies"}
        </h2>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>
      <div className="overflow-auto">
        <Table>
          <AssetsTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <TableBody>
            {sortedAssets.map((asset) => (
              <AssetRow 
                key={asset.id}
                asset={asset} 
                onUpdateAsset={updateAsset}
                onRemoveAsset={removeAsset}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <AddAssetDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        assetType={assetType} 
      />
    </div>
  );
}
