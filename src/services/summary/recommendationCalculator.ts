
import { MethodScore, WeightedAnalysis, SummaryRecommendation } from '@/types/summaryAnalysis';

export const calculateFinalRecommendation = (
  methodScores: MethodScore[],
  weights: WeightedAnalysis
): SummaryRecommendation => {
  const availableScores = methodScores.filter(m => m.available);
  
  if (availableScores.length === 0) {
    return {
      recommendation: 'HOLD',
      confidence: 0,
      weightedScore: 0,
      reasoning: 'No analysis data available',
      keyInsights: [],
      strengths: [],
      concerns: ['Insufficient data for analysis']
    };
  }

  // Calculate weighted score
  let totalWeight = 0;
  let weightedSum = 0;
  let buySignals = 0;
  let sellSignals = 0;

  methodScores.forEach(method => {
    if (!method.available) return;

    let weight = 0;
    switch (method.method) {
      case 'Warren Buffett': weight = weights.warrenBuffett; break;
      case 'Charlie Munger': weight = weights.charlieMunger; break;
      case 'Peter Lynch': weight = weights.peterLynch; break;
      case 'Bill Ackman': weight = weights.billAckman; break;
      case 'Quantitative': weight = weights.quantitative; break;
    }

    totalWeight += weight;
    weightedSum += (method.score * weight * method.confidence / 100);

    if (method.signal === 'BUY' || method.signal === 'bullish') buySignals++;
    if (method.signal === 'SELL' || method.signal === 'bearish') sellSignals++;
  });

  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Determine final recommendation
  let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = 50;

  if (weightedScore >= 70 && buySignals >= 2) {
    recommendation = 'BUY';
    confidence = Math.min(95, weightedScore);
  } else if (weightedScore <= 39 && sellSignals >= 2) {
    recommendation = 'SELL';
    confidence = Math.min(95, 100 - weightedScore);
  } else {
    recommendation = 'HOLD';
    confidence = Math.abs(weightedScore - 50) + 40;
  }

  // Generate enhanced insights
  const strongMethods = availableScores.filter(m => m.score >= 70 && m.confidence >= 70);
  const weakMethods = availableScores.filter(m => m.score <= 40 && m.confidence >= 70);

  const keyInsights = [
    `Based on ${availableScores.length} available analysis methods`,
    `Weighted score: ${weightedScore.toFixed(1)}/100`,
    `${buySignals} positive signals, ${sellSignals} negative signals`
  ];

  const strengths = generateStrengths(strongMethods);
  const concerns = generateConcerns(weakMethods);
  const reasoning = generateRecommendationReasoning(recommendation, weightedScore, availableScores.length, buySignals, sellSignals);

  return {
    recommendation,
    confidence: Math.round(confidence),
    weightedScore: Math.round(weightedScore),
    reasoning,
    keyInsights,
    strengths,
    concerns
  };
};

const generateStrengths = (strongMethods: MethodScore[]): string[] => {
  return strongMethods.map(method => {
    const score = Math.round(method.score);
    const confidenceLevel = Math.round(method.confidence);
    
    switch (method.method) {
      case 'Warren Buffett':
        return `Strong value fundamentals with ${score}/100 compounding score and ${confidenceLevel}% confidence - indicates solid business moat and consistent earnings growth`;
      case 'Charlie Munger':
        return `Excellent business quality metrics scoring ${score}/100 with ${confidenceLevel}% confidence - demonstrates competitive advantages and rational management`;
      case 'Peter Lynch':
        return `Attractive growth opportunity with ${score}/100 Lynch score and ${confidenceLevel}% confidence - shows strong earnings growth potential at reasonable valuation`;
      case 'Bill Ackman':
        return `High-quality business characteristics scoring ${score}/100 with ${confidenceLevel}% confidence - exhibits pricing power and sustainable competitive position`;
      case 'Quantitative':
        return `Strong quantitative metrics with ${score}/100 combined score and ${confidenceLevel}% confidence - technical and fundamental indicators align positively`;
      default:
        return `${method.method} shows strong positive indicators with ${score}/100 score and ${confidenceLevel}% confidence`;
    }
  });
};

const generateConcerns = (weakMethods: MethodScore[]): string[] => {
  return weakMethods.map(method => {
    const score = Math.round(method.score);
    const confidenceLevel = Math.round(method.confidence);
    
    switch (method.method) {
      case 'Warren Buffett':
        return `Value concerns with low ${score}/100 compounding score and ${confidenceLevel}% confidence - suggests limited business moat or declining fundamentals`;
      case 'Charlie Munger':
        return `Business quality issues with ${score}/100 score and ${confidenceLevel}% confidence - indicates potential competitive disadvantages or management concerns`;
      case 'Peter Lynch':
        return `Growth challenges with ${score}/100 Lynch score and ${confidenceLevel}% confidence - shows limited growth prospects or overvaluation relative to growth`;
      case 'Bill Ackman':
        return `Business model weaknesses scoring ${score}/100 with ${confidenceLevel}% confidence - suggests limited pricing power or unsustainable competitive position`;
      case 'Quantitative':
        return `Weak quantitative signals with ${score}/100 combined score and ${confidenceLevel}% confidence - technical and fundamental indicators show negative trends`;
      default:
        return `${method.method} shows concerning indicators with ${score}/100 score and ${confidenceLevel}% confidence`;
    }
  });
};

const generateRecommendationReasoning = (
  recommendation: string,
  score: number,
  methodCount: number,
  buySignals: number,
  sellSignals: number
): string => {
  if (recommendation === 'BUY') {
    return `Strong BUY signal with ${score.toFixed(1)}/100 weighted score. ${buySignals} positive signals from ${methodCount} analysis methods indicate strong investment potential.`;
  } else if (recommendation === 'SELL') {
    return `SELL signal with ${score.toFixed(1)}/100 weighted score. ${sellSignals} negative signals from ${methodCount} analysis methods suggest avoiding this investment.`;
  } else {
    return `HOLD recommendation with ${score.toFixed(1)}/100 weighted score. Mixed or neutral signals from ${methodCount} analysis methods suggest maintaining current position or waiting for clearer direction.`;
  }
};
