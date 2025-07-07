
import { FinancialSnapshot } from '../financialDatasetsService';
import { ActivismPotentialAnalysis } from '@/types/billAckmanAnalysis';

export const analyzeActivismPotential = (data: FinancialSnapshot): ActivismPotentialAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // Look for operational gaps (good revenue but poor margins)
  const revenueGrowth = data.revenue_growth || 0;
  const operatingMargin = data.operating_margin || 0;
  
  const operationalGaps = revenueGrowth > 0.05 && operatingMargin < 0.15;
  if (operationalGaps) {
    score += 3;
    details.push('Revenue growth with subpar margins suggests operational improvement opportunity');
  }
  
  // Margin improvement potential
  let marginImprovement: number | null = null;
  if (operatingMargin < 0.15 && operatingMargin > 0) {
    marginImprovement = 0.15 - operatingMargin;
    score += 2;
    details.push(`Potential margin expansion: ${(marginImprovement * 100).toFixed(1)}pp to reach 15% target`);
  }
  
  // Management efficiency assessment
  const returnOnAssets = data.return_on_assets;
  let managementEfficiency: 'high' | 'medium' | 'low' = 'low';
  
  if (returnOnAssets !== null) {
    if (returnOnAssets > 0.10) {
      managementEfficiency = 'high';
      details.push(`Efficient asset utilization: ${(returnOnAssets * 100).toFixed(1)}% ROA`);
    } else if (returnOnAssets > 0.05) {
      managementEfficiency = 'medium';
      score += 1;
      details.push(`Moderate asset efficiency: ${(returnOnAssets * 100).toFixed(1)}% ROA`);
    } else {
      score += 2;
      details.push(`Low asset efficiency suggests management improvement opportunity`);
    }
  }
  
  // Value creation opportunity
  const valueCreationOpportunity = operationalGaps && marginImprovement !== null && marginImprovement > 0.05 
    ? 'high' 
    : operationalGaps || (marginImprovement !== null && marginImprovement > 0.02)
    ? 'medium'
    : 'low';
  
  if (valueCreationOpportunity === 'high') {
    score += 2;
    details.push('High potential for activist value creation');
  } else if (valueCreationOpportunity === 'medium') {
    score += 1;
    details.push('Moderate activist opportunity identified');
  }
  
  return {
    operationalGaps,
    marginImprovement,
    managementEfficiency,
    valueCreationOpportunity,
    score: Math.min(10, score),
    details
  };
};
