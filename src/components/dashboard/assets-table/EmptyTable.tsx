
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AssetType } from "@/types";

interface EmptyTableProps {
  assetType: AssetType;
  onAddAsset: () => void;
}

export function EmptyTable({ assetType, onAddAsset }: EmptyTableProps) {
  const assetTypeName = assetType === "stock" ? "stock" : "cryptocurrency";

  return (
    <div className="rounded-lg border p-8 text-center">
      <h3 className="text-lg font-medium mb-2">
        No {assetType === "stock" ? "stocks" : "cryptocurrencies"} yet
      </h3>
      <p className="text-muted-foreground mb-6">
        Add your first {assetTypeName} position to start tracking your portfolio.
      </p>
      <Button onClick={onAddAsset}>
        <Plus className="h-4 w-4 mr-2" />
        Add {assetTypeName}
      </Button>
    </div>
  );
}
