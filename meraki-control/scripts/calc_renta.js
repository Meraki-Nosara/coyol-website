// 2025 Full Year Actuals
const sales2025 = 2495587019;  // ₡2.496B
const gastos2025 = 971009200;  // ₡971M purchases
const payroll2025 = 627600000; // ₡627.6M base wages

// Cargas sociales multiplier
const cargasMultiplier = 1.47;
const totalLabor2025 = payroll2025 * cargasMultiplier;

// 2025 Operating Profit
const operatingProfit2025 = sales2025 - gastos2025 - totalLabor2025;

console.log("=== 2025 ACTUAL ===");
console.log(`Sales:     ₡${(sales2025/1000000).toFixed(0)}M`);
console.log(`Purchases: ₡${(gastos2025/1000000).toFixed(0)}M (${(gastos2025/sales2025*100).toFixed(0)}%)`);
console.log(`Labor:     ₡${(totalLabor2025/1000000).toFixed(0)}M (${(totalLabor2025/sales2025*100).toFixed(0)}%)`);
console.log(`Op Profit: ₡${(operatingProfit2025/1000000).toFixed(0)}M (${(operatingProfit2025/sales2025*100).toFixed(0)}%)`);

// 2026 Projection (assuming same ratios, +3% sales growth)
const salesGrowth = 1.03;
const sales2026 = sales2025 * salesGrowth;
const gastos2026 = gastos2025 * salesGrowth;
const labor2026 = totalLabor2025 * salesGrowth;
const operatingProfit2026 = sales2026 - gastos2026 - labor2026;

console.log("\n=== 2026 PROJECTION ===");
console.log(`Sales:     ₡${(sales2026/1000000).toFixed(0)}M`);
console.log(`Purchases: ₡${(gastos2026/1000000).toFixed(0)}M`);
console.log(`Labor:     ₡${(labor2026/1000000).toFixed(0)}M`);
console.log(`Op Profit: ₡${(operatingProfit2026/1000000).toFixed(0)}M`);

// Costa Rica Renta calculation (2024 brackets - businesses)
function calculateRenta(profit) {
  const brackets = [
    { limit: 5761000, rate: 0.05 },
    { limit: 8643000, rate: 0.10 },
    { limit: 17286000, rate: 0.15 },
    { limit: 34572000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
  ];
  
  let tax = 0;
  let prev = 0;
  
  for (const bracket of brackets) {
    if (profit <= prev) break;
    const taxable = Math.min(profit, bracket.limit) - prev;
    if (taxable > 0) {
      tax += taxable * bracket.rate;
    }
    prev = bracket.limit;
  }
  
  return tax;
}

const renta2026 = calculateRenta(operatingProfit2026);
const effectiveRate = (renta2026 / operatingProfit2026 * 100);
const netAfterTax = operatingProfit2026 - renta2026;

console.log("\n=== RENTA 2026 ESTIMATE ===");
console.log(`Taxable Income: ₡${(operatingProfit2026/1000000).toFixed(0)}M`);
console.log(`Renta Due:      ₡${(renta2026/1000000).toFixed(0)}M`);
console.log(`Effective Rate: ${effectiveRate.toFixed(1)}%`);
console.log(`Net After Tax:  ₡${(netAfterTax/1000000).toFixed(0)}M ($${(netAfterTax/505/1000).toFixed(0)}K USD)`);

// How much deductions needed to reduce renta
console.log("\n=== DEDUCTION SCENARIOS ===");
const scenarios = [50000000, 100000000, 150000000, 200000000];
scenarios.forEach(deduction => {
  const reducedProfit = operatingProfit2026 - deduction;
  const reducedRenta = calculateRenta(reducedProfit);
  const savings = renta2026 - reducedRenta;
  console.log(`₡${(deduction/1000000).toFixed(0)}M deductions → Renta: ₡${(reducedRenta/1000000).toFixed(0)}M (saves ₡${(savings/1000000).toFixed(0)}M)`);
});

console.log("\n=== KEY NUMBERS ===");
console.log(`Projected Renta: ₡${(renta2026/1000000).toFixed(0)}M ($${(renta2026/505/1000).toFixed(0)}K USD)`);
