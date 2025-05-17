
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onRefresh: () => void;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Portfolio Dashboard</h2>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Prices
      </Button>
    </div>
  );
}
