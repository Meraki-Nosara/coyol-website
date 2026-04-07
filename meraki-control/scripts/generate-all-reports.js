#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const salesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sales.json'), 'utf8'));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const USD_RATE = 505;

function fmt(amount, currency = 'CRC') {
  if (currency === 'USD') {
    return '$' + (amount / USD_RATE / 1000000).toFixed(2) + 'M';
  }
  return '₡' + (amount / 1000000).toFixed(1) + 'M';
}

function fmtFull(amount, currency = 'CRC') {
  if (currency === 'USD') {
    return '$' + Math.round(amount / USD_RATE).toLocaleString();
  }
  return '₡' + amount.toLocaleString();
}

function generateMonthlyReport(year, month, currency = 'CRC') {
  const monthNum = String(month).padStart(2, '0');
  const monthName = MONTHS[month - 1];
  
  // Get data for this month
  const yearKey = `monthly${year}`;
  const gastosKey = `gastos${year}`;
  
  const eshData = salesData[yearKey]?.esh?.[monthNum];
  const lalunaSales = salesData[yearKey]?.laluna?.[monthNum];
  const coyolData = salesData[yearKey]?.coyol?.[monthNum] || salesData[yearKey]?.coyol?.annual;
  
  const eshGastos = salesData[gastosKey]?.esh?.[monthNum] || 0;
  const lalunagastos = salesData[gastosKey]?.laluna?.[monthNum] || 0;
  const coyolGastos = salesData[gastosKey]?.coyol?.[monthNum] || 0;
  
  // For 2026, use different structure
  const is2026 = year === 2026;
  let esh, laluna, coyol;
  
  if (is2026) {
    esh = salesData.monthly2026?.esh?.[monthNum] || null;
    laluna = salesData.monthly2026?.laluna?.[monthNum] || null;
    coyol = salesData.monthly2026?.coyol?.[monthNum] || null;
  } else {
    esh = eshData ? { sales: eshData.sales, food: eshData.food, bar: eshData.bar } : null;
    laluna = lalunaSales ? { sales: lalunaSales.sales, food: lalunaSales.food, bar: lalunaSales.bar } : null;
    coyol = null; // Coyol 2025 only has annual
  }
  
  if (!esh && !laluna && !coyol) {
    console.log(`Skipping ${monthName} ${year} - no data`);
    return null;
  }
  
  // Calculate totals
  const restaurants = [];
  let totalSales = 0;
  let totalGastos = 0;
  let totalFood = 0;
  let totalBar = 0;
  
  if (esh) {
    const profit = esh.sales - eshGastos;
    const margin = esh.sales > 0 ? (profit / esh.sales * 100) : 0;
    restaurants.push({
      name: 'Esh',
      color: '#C4A67C',
      sales: esh.sales,
      food: esh.food || Math.round(esh.sales * 0.65),
      bar: esh.bar || Math.round(esh.sales * 0.35),
      gastos: eshGastos,
      profit,
      margin
    });
    totalSales += esh.sales;
    totalGastos += eshGastos;
    totalFood += esh.food || Math.round(esh.sales * 0.65);
    totalBar += esh.bar || Math.round(esh.sales * 0.35);
  }
  
  if (laluna) {
    const profit = laluna.sales - lalunagastos;
    const margin = laluna.sales > 0 ? (profit / laluna.sales * 100) : 0;
    restaurants.push({
      name: 'La Luna',
      color: '#A65D3F',
      sales: laluna.sales,
      food: laluna.food || Math.round(laluna.sales * 0.59),
      bar: laluna.bar || Math.round(laluna.sales * 0.41),
      gastos: lalunagastos,
      profit,
      margin
    });
    totalSales += laluna.sales;
    totalGastos += lalunagastos;
    totalFood += laluna.food || Math.round(laluna.sales * 0.59);
    totalBar += laluna.bar || Math.round(laluna.sales * 0.41);
  }
  
  if (coyol) {
    const profit = coyol.sales - coyolGastos;
    const margin = coyol.sales > 0 ? (profit / coyol.sales * 100) : 0;
    restaurants.push({
      name: 'Coyol',
      color: '#3D4F3D',
      sales: coyol.sales,
      food: coyol.food || Math.round(coyol.sales * 0.58),
      bar: coyol.bar || Math.round(coyol.sales * 0.42),
      gastos: coyolGastos,
      profit,
      margin
    });
    totalSales += coyol.sales;
    totalGastos += coyolGastos;
    totalFood += coyol.food || Math.round(coyol.sales * 0.58);
    totalBar += coyol.bar || Math.round(coyol.sales * 0.42);
  }
  
  const totalProfit = totalSales - totalGastos;
  const totalMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;
  const foodPct = totalSales > 0 ? (totalFood / totalSales * 100) : 0;
  const barPct = totalSales > 0 ? (totalBar / totalSales * 100) : 0;
  
  // Get previous month for comparison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthNum = String(prevMonth).padStart(2, '0');
  const prevYearKey = `monthly${prevYear}`;
  
  let prevTotalSales = 0;
  if (salesData[prevYearKey]?.esh?.[prevMonthNum]) {
    prevTotalSales += salesData[prevYearKey].esh[prevMonthNum].sales || 0;
  }
  if (salesData[prevYearKey]?.laluna?.[prevMonthNum]) {
    prevTotalSales += salesData[prevYearKey].laluna[prevMonthNum].sales || 0;
  }
  
  const momChange = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales * 100) : 0;
  
  // Generate HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Meraki Financial Analysis - ${monthName} ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #1a1f16;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3D4F3D;
    }
    .header h1 {
      font-size: 28px;
      color: #3D4F3D;
      margin-bottom: 5px;
    }
    .header h2 {
      font-size: 20px;
      color: #666;
      font-weight: normal;
    }
    .summary-box {
      background: #3D4F3D;
      color: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary-box h3 {
      font-size: 16px;
      opacity: 0.8;
      margin-bottom: 15px;
    }
    .summary-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .stat { min-width: 100px; }
    .stat-value { font-size: 28px; font-weight: bold; }
    .stat-label { font-size: 12px; opacity: 0.7; }
    
    h3 {
      color: #3D4F3D;
      font-size: 18px;
      margin: 30px 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 14px;
    }
    th {
      background: #f5f5f5;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #3D4F3D;
    }
    th:not(:first-child) { text-align: right; }
    td {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    td:not(:first-child) { text-align: right; }
    tr:hover { background: #fafafa; }
    
    .restaurant-row td:first-child {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .good { color: #2d7a2d; }
    .warning { color: #b8860b; }
    .bad { color: #c0392b; }
    
    .margin-bar {
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .margin-fill {
      height: 100%;
      border-radius: 4px;
    }
    
    .totals-row {
      font-weight: bold;
      background: #f9f9f9;
    }
    
    .insights {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .insights h3 {
      margin-top: 0;
      border: none;
    }
    .insight-item {
      margin: 10px 0;
      padding: 10px 15px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #3D4F3D;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    
    @media print {
      body { padding: 20px; }
      .summary-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Meraki Financial Analysis</h1>
    <h2>${monthName} ${year}</h2>
  </div>
  
  <div class="summary-box">
    <h3>Monthly Summary</h3>
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-value">${fmt(totalSales, currency)}</div>
        <div class="stat-label">Total Sales</div>
      </div>
      <div class="stat">
        <div class="stat-value">${fmt(totalGastos, currency)}</div>
        <div class="stat-label">Expenses</div>
      </div>
      <div class="stat">
        <div class="stat-value">${fmt(totalProfit, currency)}</div>
        <div class="stat-label">Gross Profit</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalMargin.toFixed(0)}%</div>
        <div class="stat-label">Margin</div>
      </div>
      ${prevTotalSales > 0 ? `
      <div class="stat">
        <div class="stat-value ${momChange >= 0 ? 'good' : 'bad'}">${momChange >= 0 ? '↑' : '↓'}${Math.abs(momChange).toFixed(1)}%</div>
        <div class="stat-label">vs Previous Month</div>
      </div>
      ` : ''}
    </div>
  </div>
  
  <h3>Sales by Restaurant</h3>
  <table>
    <thead>
      <tr>
        <th>Restaurant</th>
        <th>Sales</th>
        <th>Food</th>
        <th>Bar</th>
        <th>Expenses</th>
        <th>Profit</th>
        <th>Margin</th>
      </tr>
    </thead>
    <tbody>
      ${restaurants.map(r => `
      <tr class="restaurant-row">
        <td><span class="color-dot" style="background: ${r.color}"></span> ${r.name}</td>
        <td>${fmtFull(r.sales, currency)}</td>
        <td>${fmtFull(r.food, currency)}</td>
        <td>${fmtFull(r.bar, currency)}</td>
        <td class="bad">${fmtFull(r.gastos, currency)}</td>
        <td class="good">${fmtFull(r.profit, currency)}</td>
        <td>
          <span class="${r.margin >= 50 ? 'good' : r.margin >= 30 ? 'warning' : 'bad'}">${r.margin.toFixed(0)}%</span>
          <div class="margin-bar">
            <div class="margin-fill" style="width: ${Math.min(r.margin, 100)}%; background: ${r.margin >= 50 ? '#2d7a2d' : r.margin >= 30 ? '#b8860b' : '#c0392b'}"></div>
          </div>
        </td>
      </tr>
      `).join('')}
      <tr class="totals-row">
        <td>Total</td>
        <td>${fmtFull(totalSales, currency)}</td>
        <td>${fmtFull(totalFood, currency)}</td>
        <td>${fmtFull(totalBar, currency)}</td>
        <td class="bad">${fmtFull(totalGastos, currency)}</td>
        <td class="good">${fmtFull(totalProfit, currency)}</td>
        <td><span class="${totalMargin >= 50 ? 'good' : totalMargin >= 30 ? 'warning' : 'bad'}">${totalMargin.toFixed(0)}%</span></td>
      </tr>
    </tbody>
  </table>
  
  <h3>Revenue Mix</h3>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Amount</th>
        <th>% of Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>🍽️ Food</td>
        <td>${fmtFull(totalFood, currency)}</td>
        <td>${foodPct.toFixed(0)}%</td>
      </tr>
      <tr>
        <td>🍷 Bar/Drinks</td>
        <td>${fmtFull(totalBar, currency)}</td>
        <td>${barPct.toFixed(0)}%</td>
      </tr>
    </tbody>
  </table>
  
  <div class="insights">
    <h3>📊 Key Insights</h3>
    ${restaurants.length > 1 ? `
    <div class="insight-item">
      <strong>Top Performer:</strong> ${restaurants.sort((a, b) => b.sales - a.sales)[0].name} led with ${fmt(restaurants[0].sales, currency)} in sales
    </div>
    ` : ''}
    ${restaurants.find(r => r.margin >= 50) ? `
    <div class="insight-item">
      <strong>Strong Margins:</strong> ${restaurants.filter(r => r.margin >= 50).map(r => r.name).join(', ')} achieved 50%+ gross margin
    </div>
    ` : ''}
    ${restaurants.find(r => r.margin < 30) ? `
    <div class="insight-item">
      <strong>⚠️ Margin Alert:</strong> ${restaurants.filter(r => r.margin < 30).map(r => r.name).join(', ')} had margins below 30%
    </div>
    ` : ''}
    <div class="insight-item">
      <strong>Food vs Bar:</strong> Food represents ${foodPct.toFixed(0)}% of revenue, Bar ${barPct.toFixed(0)}%
    </div>
  </div>
  
  <div class="footer">
    <p>Generated by Meraki Control System • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>Currency: ${currency} ${currency === 'USD' ? `(@ ₡${USD_RATE}/USD)` : ''}</p>
  </div>
</body>
</html>`;
  
  return { html, monthName, year };
}

// Generate reports for all available months
const reportsDir = path.join(__dirname, '../public/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const generated = [];

// 2025 months (Esh and La Luna have data)
for (let month = 1; month <= 12; month++) {
  const report = generateMonthlyReport(2025, month, 'CRC');
  if (report) {
    const filename = `${report.monthName.toLowerCase()}-${report.year}-analysis.html`;
    const filepath = path.join(reportsDir, filename);
    fs.writeFileSync(filepath, report.html);
    generated.push(filename);
    console.log(`✅ Generated: ${filename}`);
  }
}

// 2026 Q1 (all 3 restaurants)
for (let month = 1; month <= 3; month++) {
  const report = generateMonthlyReport(2026, month, 'CRC');
  if (report) {
    const filename = `${report.monthName.toLowerCase()}-${report.year}-analysis.html`;
    const filepath = path.join(reportsDir, filename);
    fs.writeFileSync(filepath, report.html);
    generated.push(filename);
    console.log(`✅ Generated: ${filename}`);
  }
}

console.log(`\n📄 Generated ${generated.length} reports in public/reports/`);

// Now convert HTML to PDF using playwright or wkhtmltopdf if available
console.log('\n📑 Converting to PDF...');

generated.forEach(htmlFile => {
  const htmlPath = path.join(reportsDir, htmlFile);
  const pdfPath = htmlPath.replace('.html', '.pdf');
  
  try {
    // Try using wkhtmltopdf first (faster)
    execSync(`wkhtmltopdf --quiet "${htmlPath}" "${pdfPath}" 2>/dev/null`, { stdio: 'pipe' });
    console.log(`✅ PDF: ${htmlFile.replace('.html', '.pdf')}`);
  } catch (e) {
    console.log(`⚠️  Could not convert ${htmlFile} to PDF (wkhtmltopdf not available)`);
  }
});

console.log('\n✅ Done!');
