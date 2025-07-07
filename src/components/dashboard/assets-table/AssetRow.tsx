
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent, getChangeColor } from "@/lib/utils";
import { AssetWithPrice } from "@/types";

interface AssetRowProps {
  asset: AssetWithPrice;
  onUpdateAsset: (id: string, updates: Partial<AssetWithPrice>) => void;
  onRemoveAsset: (id: string) => void;
}

export function AssetRow({ asset, onUpdateAsset, onRemoveAsset }: AssetRowProps) {
  const [editingField, setEditingField] = useState<"quantity" | "avgCost" | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Handle editing fields
  const startEditing = (field: "quantity" | "avgCost") => {
    setEditingField(field);
    setEditValue(
      field === "quantity" 
        ? asset.quantity.toString() 
        : asset.avgCost?.toString() || "0"
    );
  };

  const saveEdit = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onUpdateAsset(asset.id, { 
        [editingField as string]: newValue 
      });
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  // Handle key press in edit input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <TableRow key={asset.id}>
      <TableCell className="font-medium">{asset.ticker}</TableCell>
      <TableCell>{asset.name}</TableCell>
      <TableCell>
        {editingField === "quantity" ? (
          <Input
            autoFocus
            type="number"
            min="0"
            step="any"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            className="w-24 h-8 quantity-edit"
          />
        ) : (
          <span 
            className="cursor-pointer hover:underline" 
            onClick={() => startEditing("quantity")}
          >
            {formatNumber(asset.quantity, asset.type === "crypto" ? 6 : 2)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(asset.currentPrice)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(asset.marketValue)}
      </TableCell>
      <TableCell className={`text-right ${getChangeColor(asset.priceChangePercent)}`}>
        <div className="flex items-center justify-end">
          {asset.priceChangePercent && asset.priceChangePercent > 0 ? (
            <ArrowUp className="h-3 w-3 mr-1" />
          ) : asset.priceChangePercent && asset.priceChangePercent < 0 ? (
            <ArrowDown className="h-3 w-3 mr-1" />
          ) : null}
          {asset.priceChangePercent !== undefined 
            ? formatPercent(asset.priceChangePercent) 
            : "-"}
        </div>
      </TableCell>
      <TableCell>
        {editingField === "avgCost" ? (
          <Input
            autoFocus
            type="number"
            min="0"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            className="w-24 h-8"
          />
        ) : (
          <span 
            className="cursor-pointer hover:underline" 
            onClick={() => startEditing("avgCost")}
          >
            {asset.avgCost ? formatCurrency(asset.avgCost) : "Set cost"}
          </span>
        )}
      </TableCell>
      <TableCell className={`text-right ${getChangeColor(asset.pnl)}`}>
        <div className="flex items-center justify-end">
          {asset.pnl ? (
            <>
              {asset.pnl > 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : asset.pnl < 0 ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : null}
              {formatCurrency(asset.pnl)}
            </>
          ) : (
            "-"
          )}
        </div>
      </TableCell>
      <TableCell className={`text-right ${getChangeColor(asset.pnlPercent)}`}>
        <div className="flex items-center justify-end">
          {asset.pnlPercent ? (
            <>
              {asset.pnlPercent > 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : asset.pnlPercent < 0 ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : null}
              {formatPercent(asset.pnlPercent)}
            </>
          ) : (
            "-"
          )}
        </div>
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemoveAsset(asset.id)}
          className="h-8 w-8 p-0"
        >
          &times;
        </Button>
      </TableCell>
    </TableRow>
  );
}
