
import { Navbar } from "@/components/layout/Navbar";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useQueryClient } from "@tanstack/react-query";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { DashboardHeader } from "@/components/dashboard/summary/DashboardHeader";
import { PortfolioSummary } from "@/components/dashboard/summary/PortfolioSummary";
import { AssetTabs } from "@/components/dashboard/tabs/AssetTabs";
import { PnLChart } from "@/components/dashboard/charts/PnLChart";

const Index = () => {
  const queryClient = useQueryClient();
  const { assets } = usePortfolioStore();
  
  const {
    activeTab,
    setActiveTab,
    assetsWithPrices,
    allAssetsWithPrices,
    isLoading,
    summary,
    totalValue,
    totalDailyChange,
    totalDailyChangePercent,
    hasAllCostBasis,
    totalPnL,
    totalPnLPercent
  } = usePortfolioSummary(assets);
  
  // Handle manual refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ 
      queryKey: [`${activeTab}-prices`]
    });
    // Also refresh portfolio history data
    queryClient.invalidateQueries({
      queryKey: ['portfolio-history']
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-6 px-4">
        <DashboardHeader onRefresh={handleRefresh} />
        
        {/* Summary Cards */}
        <PortfolioSummary
          totalValue={totalValue}
          totalDailyChange={totalDailyChange}
          totalDailyChangePercent={totalDailyChangePercent}
          totalPnL={totalPnL}
          totalPnLPercent={totalPnLPercent}
          activeTab={activeTab}
          summary={summary}
          isLoading={isLoading}
          hasAllCostBasis={hasAllCostBasis}
          hasAssets={assets.length > 0}
        />
        
        {/* PnL Chart - Showing for all users with portfolio data */}
        <div className="mb-6">
          <PnLChart
            assetsWithPrices={allAssetsWithPrices}
            totalPnL={totalPnL}
            totalPnLPercent={totalPnLPercent}
            hasAllCostBasis={hasAllCostBasis}
            isLoading={isLoading}
          />
        </div>
        
        {/* Portfolio Allocation Chart */}
        <div className="mb-6">
          <AllocationChart 
            assets={allAssetsWithPrices} 
            isLoading={isLoading && assets.length > 0} 
          />
        </div>
        
        {/* Asset Tables */}
        <AssetTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          assetsWithPrices={assetsWithPrices}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default Index;
