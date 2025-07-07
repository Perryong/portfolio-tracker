
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetType } from "@/types";

interface LoadingTableProps {
  assetType: AssetType;
}

export function LoadingTable({ assetType }: LoadingTableProps) {
  // Generate 5 rows of skeleton loading states
  const loadingRows = Array(5)
    .fill(0)
    .map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-20 ml-auto" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-24 ml-auto" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-16 ml-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-20 ml-auto" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-16 ml-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-6" />
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="rounded-lg border">
      <div className="p-4">
        <h2 className="text-lg font-semibold">
          {assetType === "stock" ? "Stocks" : "Cryptocurrencies"}
        </h2>
        <Skeleton className="h-8 w-24 mt-2" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">24h</TableHead>
            <TableHead>Avg Cost</TableHead>
            <TableHead className="text-right">P/L</TableHead>
            <TableHead className="text-right">P/L %</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{loadingRows}</TableBody>
      </Table>
    </div>
  );
}
