// AI Automation Engine — simulates advanced AI-powered slot management

export interface AiInsight {
  id: string;
  type: "prediction" | "optimization" | "match" | "anomaly";
  title: string;
  description: string;
  confidence: number;
  impact: string;
  timestamp: Date;
  action?: string;
}

export interface DemandForecast {
  hour: string;
  predicted: number;
  actual: number;
  confidence: number;
}

export interface PriceSuggestion {
  slotId: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
  expectedFillRate: number;
}

// Simulated AI insights
export function generateInsights(): AiInsight[] {
  return [
    { id: "1", type: "prediction", title: "Surge Expected: Beauty Sector", description: "ML model predicts 340% increase in beauty cancellations between 2-4 PM EST based on weather patterns and historical data.", confidence: 0.92, impact: "+$12,400 potential recovery", timestamp: new Date(), action: "Pre-position notifications" },
    { id: "2", type: "optimization", title: "Dynamic Pricing Adjustment", description: "Aviation slots are underpriced by 18% relative to demand. Adjusting prices will increase fill rate from 67% to 89%.", confidence: 0.87, impact: "+$45,000 revenue/day", timestamp: new Date(), action: "Apply pricing" },
    { id: "3", type: "match", title: "Perfect Match Found", description: "User cluster 'Executive Wellness' has 94% match with 3 upcoming spa cancellations in Tribeca.", confidence: 0.94, impact: "3 slots auto-filled", timestamp: new Date(), action: "Auto-notify" },
    { id: "4", type: "anomaly", title: "Unusual Pattern: Restaurant Sector", description: "15% spike in same-day cancellations at Michelin restaurants. Possible event conflict detected.", confidence: 0.78, impact: "Alert merchants", timestamp: new Date(), action: "Send alerts" },
    { id: "5", type: "prediction", title: "Logistics Demand Wave", description: "Port congestion data suggests 5 berth cancellations in Rotterdam within 6 hours.", confidence: 0.85, impact: "+$41,000 recovery", timestamp: new Date(), action: "Pre-list slots" },
  ];
}

export function generateDemandForecast(): DemandForecast[] {
  const hours = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"];
  return hours.map((hour, i) => ({
    hour,
    predicted: Math.round(20 + Math.sin(i / 2) * 40 + Math.random() * 15),
    actual: Math.round(18 + Math.sin(i / 2) * 38 + Math.random() * 20),
    confidence: 0.75 + Math.random() * 0.2,
  }));
}

export interface RevenueData {
  day: string;
  recovered: number;
  lost: number;
  optimized: number;
}

export function generateWeeklyRevenue(): RevenueData[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    recovered: Math.round(180000 + Math.random() * 220000),
    lost: Math.round(20000 + Math.random() * 60000),
    optimized: Math.round(40000 + Math.random() * 80000),
  }));
}

export interface SectorBreakdown {
  name: string;
  value: number;
  fill: string;
}

export function generateSectorBreakdown(): SectorBreakdown[] {
  return [
    { name: "Aviation", value: 38, fill: "hsl(217, 91%, 60%)" },
    { name: "Beauty", value: 22, fill: "hsl(45, 96%, 57%)" },
    { name: "Health", value: 18, fill: "hsl(142, 71%, 45%)" },
    { name: "Dining", value: 12, fill: "hsl(0, 84%, 60%)" },
    { name: "Logistics", value: 7, fill: "hsl(280, 70%, 55%)" },
    { name: "Fitness", value: 3, fill: "hsl(200, 80%, 50%)" },
  ];
}

export interface FillRateData {
  hour: string;
  rate: number;
  target: number;
}

export function generateFillRateTimeline(): FillRateData[] {
  const hours = ["12AM", "3AM", "6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
  return hours.map((hour, i) => ({
    hour,
    rate: Math.round(40 + Math.sin(i / 1.5) * 30 + Math.random() * 15),
    target: 85,
  }));
}

export function generatePriceSuggestions(): PriceSuggestion[] {
  return [
    { slotId: "1", currentPrice: 89, suggestedPrice: 72, reason: "Expiring in <30min, lower price increases fill probability to 95%", expectedFillRate: 0.95 },
    { slotId: "2", currentPrice: 4200, suggestedPrice: 4800, reason: "High demand corridor, price can increase without reducing fill rate", expectedFillRate: 0.82 },
    { slotId: "4", currentPrice: 280, suggestedPrice: 240, reason: "Similar slots filled at this price point 3x faster", expectedFillRate: 0.91 },
  ];
}

// AI Automation status
export interface AutomationStatus {
  slotsAutoFilled: number;
  revenueOptimized: number;
  matchesMade: number;
  predictionsAccuracy: number;
  activeModels: string[];
}

export function getAutomationStatus(): AutomationStatus {
  return {
    slotsAutoFilled: 847 + Math.floor(Math.random() * 20),
    revenueOptimized: 2_400_000 + Math.floor(Math.random() * 50000),
    matchesMade: 1243 + Math.floor(Math.random() * 30),
    predictionsAccuracy: 0.89 + Math.random() * 0.06,
    activeModels: ["DemandForecaster v3.2", "PriceOptimizer v2.1", "SlotMatcher v4.0", "AnomalyDetector v1.8", "BundleEngine v2.5"],
  };
}
