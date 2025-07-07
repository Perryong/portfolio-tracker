
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface SortableHeader {
  field: string;
  label: string;
  sortable?: boolean;
}

interface AssetsTableHeaderProps {
  sortField: string | null;
  sortDirection: "asc" | "desc" | null;
  onSort: (field: string) => void;
}

export function AssetsTableHeader({
  sortField,
  sortDirection,
  onSort,
}: AssetsTableHeaderProps) {
  const headers: SortableHeader[] = [
    { field: "ticker", label: "Symbol", sortable: true },
    { field: "name", label: "Name", sortable: true },
    { field: "quantity", label: "Quantity", sortable: true },
    { field: "currentPrice", label: "Price", sortable: true },
    { field: "marketValue", label: "Value", sortable: true },
    { field: "priceChangePercent", label: "24h", sortable: true },
    { field: "avgCost", label: "Avg Cost", sortable: true },
    { field: "pnl", label: "P/L", sortable: true },
    { field: "pnlPercent", label: "P/L %", sortable: true },
    { field: "actions", label: "", sortable: false },
  ];

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead
            key={header.field}
            className={`${header.field === "actions" ? "w-10" : ""} ${
              header.sortable ? "cursor-pointer select-none" : ""
            }`}
            onClick={() => {
              if (header.sortable) {
                onSort(header.field);
              }
            }}
          >
            <div className="flex items-center">
              {header.label}
              {header.sortable && getSortIcon(header.field)}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
