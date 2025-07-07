
import { useState } from "react";
import { AssetWithPrice } from "@/types";

export function useSortableAssets(assets: AssetWithPrice[]) {
  const [sortField, setSortField] = useState<string | null>("marketValue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction or reset
    if (sortField === field) {
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection("desc");
      }
    } else {
      // New field, set to desc by default
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Apply sorting
  const sortedAssets = [...assets].sort((a, b) => {
    if (!sortField || !sortDirection) {
      return 0;
    }

    // Handle null/undefined values
    const aValue = a[sortField as keyof AssetWithPrice];
    const bValue = b[sortField as keyof AssetWithPrice];

    if (aValue === undefined || aValue === null) return sortDirection === "asc" ? -1 : 1;
    if (bValue === undefined || bValue === null) return sortDirection === "asc" ? 1 : -1;
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return {
    sortedAssets,
    sortField,
    sortDirection,
    handleSort,
  };
}
