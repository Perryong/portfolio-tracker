
import { useState } from "react";
import { TimeSeriesDataPoint } from "@/services/alphaVantageService";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoricalDataTableProps {
  data: TimeSeriesDataPoint[];
  isLoading: boolean;
}

export function HistoricalDataTable({ data, isLoading }: HistoricalDataTableProps) {
  const [sortField, setSortField] = useState<keyof TimeSeriesDataPoint>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof TimeSeriesDataPoint) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    const valueA = a[sortField];
    const valueB = b[sortField];
    return sortDirection === "asc" 
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });

  const SortIcon = ({ field }: { field: keyof TimeSeriesDataPoint }) => (
    <span className="ml-1">
      {sortField === field && (
        sortDirection === "asc" ? "↑" : "↓"
      )}
    </span>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date <SortIcon field="date" />
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort("open")}
            >
              Open <SortIcon field="open" />
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort("high")}
            >
              High <SortIcon field="high" />
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort("low")}
            >
              Low <SortIcon field="low" />
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort("close")}
            >
              Close <SortIcon field="close" />
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort("volume")}
            >
              Volume <SortIcon field="volume" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No historical data available
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow key={row.date}>
                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.open)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.high)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.low)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.close)}</TableCell>
                <TableCell className="text-right">{formatNumber(row.volume, 0)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
