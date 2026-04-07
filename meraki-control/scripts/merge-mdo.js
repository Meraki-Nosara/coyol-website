const fs = require('fs');
const path = require('path');

const monthlyPath = path.join(__dirname, '../data/monthly.json');
const mdoPath = path.join(__dirname, '../data/mdo.json');

const monthly = JSON.parse(fs.readFileSync(monthlyPath, 'utf8'));
const mdo = JSON.parse(fs.readFileSync(mdoPath, 'utf8'));

console.log('MDO data available for months:', Object.keys(mdo.months).sort());

// Merge MDO into monthly records
let updated = 0;
monthly.monthly.forEach(record => {
  const mdoMonth = mdo.months[record.month];
  if (mdoMonth && mdoMonth[record.restaurant]) {
    record.mdo = Math.round(mdoMonth[record.restaurant]);
    updated++;
    console.log(`✅ ${record.month} ${record.restaurant}: MDO ₡${(record.mdo / 1000000).toFixed(1)}M`);
  }
});

monthly.lastUpdated = new Date().toISOString();
fs.writeFileSync(monthlyPath, JSON.stringify(monthly, null, 2));

console.log(`\n📊 Updated ${updated} records with MDO data`);

// Show profit calculation example
console.log('\n--- Example: January 2025 La Luna ---');
const jan = monthly.monthly.find(m => m.month === '2025-01' && m.restaurant === 'laluna');
if (jan) {
  const sales = jan.totalSales;
  const gastos = jan.gastos || 0;
  const mdo = jan.mdo || 0;
  const grossProfit = sales - gastos;
  const netProfit = sales - gastos - mdo;
  
  console.log(`Sales:        ₡${(sales/1000000).toFixed(1)}M`);
  console.log(`Gastos:       ₡${(gastos/1000000).toFixed(1)}M`);
  console.log(`MDO:          ₡${(mdo/1000000).toFixed(1)}M`);
  console.log(`Gross Profit: ₡${(grossProfit/1000000).toFixed(1)}M (${(grossProfit/sales*100).toFixed(0)}%)`);
  console.log(`Net Profit:   ₡${(netProfit/1000000).toFixed(1)}M (${(netProfit/sales*100).toFixed(0)}%)`);
}
