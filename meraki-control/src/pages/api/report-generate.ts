import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const USD_RATE = 505;

// Generate HTML report for a specific month
function generateReportHTML(month: string, data: any): string {
  const { sales, mdo, gastos, restaurants } = data;
  
  const formatCRC = (n: number) => '₡' + Math.round(n).toLocaleString();
  const formatUSD = (n: number) => '$' + Math.round(n / USD_RATE).toLocaleString();
  
  const totalSales = restaurants.reduce((s: number, r: any) => s + r.sales, 0);
  const totalGastos = restaurants.reduce((s: number, r: any) => s + r.gastos, 0);
  const totalMDO = restaurants.reduce((s: number, r: any) => s + r.mdo, 0);
  const totalProfit = totalSales - totalGastos - totalMDO;
  const totalMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;
  
  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Meraki Financial Analysis - ${monthLabel}</title>
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
    .page { page-break-after: always; padding-bottom: 20px; }
    .page:last-child { page-break-after: avoid; }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3D4F3D;
    }
    .header h1 { font-size: 28px; color: #3D4F3D; margin-bottom: 5px; }
    .header h2 { font-size: 20px; color: #666; font-weight: normal; }
    .summary-box {
      background: #3D4F3D;
      color: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary-box h3 { font-size: 16px; opacity: 0.8; margin-bottom: 15px; }
    .summary-stats { display: flex; justify-content: space-around; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 12px; opacity: 0.7; }
    h3 {
      color: #3D4F3D;
      font-size: 18px;
      margin: 30px 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    h3:first-child { margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
    th {
      background: #f5f5f5;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #3D4F3D;
    }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    tr:hover { background: #fafafa; }
    .good { color: #2d7a2d; font-weight: bold; }
    .warning { color: #b8860b; font-weight: bold; }
    .bad { color: #c0392b; font-weight: bold; }
    .finding { margin: 15px 0; padding: 15px; border-radius: 6px; }
    .finding-good { background: #e8f5e9; border-left: 4px solid #2d7a2d; }
    .finding-warning { background: #fff8e1; border-left: 4px solid #b8860b; }
    .finding-bad { background: #ffebee; border-left: 4px solid #c0392b; }
    .finding h4 { margin-bottom: 8px; }
    .finding p { font-size: 14px; color: #555; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>

<!-- PAGE 1: Summary & Performance -->
<div class="page">
  <div class="header">
    <h1>Meraki Financial Analysis</h1>
    <h2>${monthLabel}</h2>
  </div>

  <div class="summary-box">
    <h3>Monthly Results</h3>
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-value">${formatUSD(totalSales)}</div>
        <div class="stat-label">TOTAL SALES</div>
      </div>
      <div class="stat">
        <div class="stat-value">${formatUSD(totalProfit)}</div>
        <div class="stat-label">PROFIT</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalMargin.toFixed(0)}%</div>
        <div class="stat-label">MARGIN</div>
      </div>
    </div>
  </div>

  <h3>Restaurant Performance</h3>
  <table>
    <tr>
      <th>Restaurant</th>
      <th>Sales</th>
      <th>Payments</th>
      <th>MDO</th>
      <th>Profit</th>
      <th>Margin</th>
    </tr>
    ${restaurants.map((r: any) => {
      const profit = r.sales - r.gastos - r.mdo;
      const margin = r.sales > 0 ? (profit / r.sales * 100) : 0;
      const marginClass = margin >= 40 ? 'good' : margin >= 20 ? 'warning' : 'bad';
      return `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td>${formatUSD(r.sales)}</td>
      <td>${formatUSD(r.gastos)} (${r.sales > 0 ? Math.round(r.gastos/r.sales*100) : 0}%)</td>
      <td>${formatUSD(r.mdo)} (${r.sales > 0 ? Math.round(r.mdo/r.sales*100) : 0}%)</td>
      <td class="${marginClass}">${formatUSD(profit)}</td>
      <td class="${marginClass}">${margin.toFixed(0)}%</td>
    </tr>`;
    }).join('')}
  </table>
</div>

<!-- PAGE 2: Key Findings -->
<div class="page">
  <h3>Key Findings</h3>
  ${restaurants.map((r: any) => {
    const profit = r.sales - r.gastos - r.mdo;
    const margin = r.sales > 0 ? (profit / r.sales * 100) : 0;
    const gastosPercent = r.sales > 0 ? (r.gastos / r.sales * 100) : 0;
    const mdoPercent = r.sales > 0 ? (r.mdo / r.sales * 100) : 0;
    
    let findingClass = 'finding-good';
    let icon = '✓';
    let status = 'Good Performance';
    
    if (margin < 0) {
      findingClass = 'finding-bad';
      icon = '✗';
      status = 'Operating at Loss';
    } else if (margin < 30 || gastosPercent > 50 || mdoPercent > 40) {
      findingClass = 'finding-warning';
      icon = '⚠';
      status = 'Needs Attention';
    }
    
    return `
  <div class="finding ${findingClass}">
    <h4>${icon} ${r.name} — ${status}</h4>
    <p>
      ${margin.toFixed(0)}% profit margin. 
      Food cost at ${gastosPercent.toFixed(0)}% of sales, 
      labor at ${mdoPercent.toFixed(0)}% of sales.
      ${margin >= 40 ? 'Excellent performance.' : margin >= 20 ? 'Review costs for improvement opportunities.' : 'Immediate attention required.'}
    </p>
  </div>`;
  }).join('')}

  <h3>Industry Benchmarks Comparison</h3>
  <table>
    <tr>
      <th>Cost Category</th>
      <th>Target</th>
      ${restaurants.map((r: any) => `<th>${r.name}</th>`).join('')}
    </tr>
    <tr>
      <td>Food & Beverage</td>
      <td>28-35%</td>
      ${restaurants.map((r: any) => {
        const pct = r.sales > 0 ? Math.round(r.gastos/r.sales*100) : 0;
        const cls = pct <= 35 ? 'good' : pct <= 50 ? 'warning' : 'bad';
        return `<td class="${cls}">${pct}%</td>`;
      }).join('')}
    </tr>
    <tr>
      <td>Labor (MDO)</td>
      <td>25-35%</td>
      ${restaurants.map((r: any) => {
        const pct = r.sales > 0 ? Math.round(r.mdo/r.sales*100) : 0;
        const cls = pct <= 35 ? 'good' : pct <= 45 ? 'warning' : 'bad';
        return `<td class="${cls}">${pct}%</td>`;
      }).join('')}
    </tr>
    <tr>
      <td><strong>Profit Margin</strong></td>
      <td>10-15%</td>
      ${restaurants.map((r: any) => {
        const profit = r.sales - r.gastos - r.mdo;
        const margin = r.sales > 0 ? (profit / r.sales * 100) : 0;
        const cls = margin >= 15 ? 'good' : margin >= 0 ? 'warning' : 'bad';
        return `<td class="${cls}">${margin.toFixed(0)}%</td>`;
      }).join('')}
    </tr>
  </table>
</div>

<!-- PAGE 3: Summary -->
<div class="page">
  <h3>Summary</h3>
  <table>
    <tr>
      <th>Metric</th>
      <th>CRC</th>
      <th>USD</th>
    </tr>
    <tr>
      <td>Total Sales</td>
      <td>${formatCRC(totalSales)}</td>
      <td>${formatUSD(totalSales)}</td>
    </tr>
    <tr>
      <td>Total Payments (Suppliers)</td>
      <td>${formatCRC(totalGastos)}</td>
      <td>${formatUSD(totalGastos)}</td>
    </tr>
    <tr>
      <td>Total MDO (Labor)</td>
      <td>${formatCRC(totalMDO)}</td>
      <td>${formatUSD(totalMDO)}</td>
    </tr>
    <tr>
      <td><strong>Net Profit</strong></td>
      <td><strong>${formatCRC(totalProfit)}</strong></td>
      <td><strong>${formatUSD(totalProfit)}</strong></td>
    </tr>
  </table>

  <div class="footer">
    Report generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
    Exchange rate: $1 = ₡${USD_RATE}<br>
    Data sources: Sales (Ingrid), Payments (Anlly), MDO (Abner)
  </div>
</div>

</body>
</html>`;
}

export const GET: APIRoute = async ({ url, redirect }) => {
  const month = url.searchParams.get('month');
  
  if (!month) {
    return new Response('Missing month parameter', { status: 400 });
  }
  
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const reportsDir = path.join(process.cwd(), 'reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Load monthly data
    const monthlyPath = path.join(dataDir, 'monthly.json');
    const mdoPath = path.join(dataDir, 'mdo.json');
    
    let monthlyData: any[] = [];
    let mdoData: any = { months: {} };
    
    if (fs.existsSync(monthlyPath)) {
      monthlyData = JSON.parse(fs.readFileSync(monthlyPath, 'utf8'));
    }
    if (fs.existsSync(mdoPath)) {
      mdoData = JSON.parse(fs.readFileSync(mdoPath, 'utf8'));
    }
    
    // Build restaurant data for this month
    const restaurants = ['laluna', 'coyol', 'esh'].map(code => {
      const monthData = monthlyData.find((m: any) => m.month === month && m.restaurant === code);
      const mdo = mdoData.months[month] || {};
      
      return {
        code,
        name: code === 'laluna' ? 'La Luna' : code === 'coyol' ? 'Coyol' : 'Esh',
        sales: monthData?.totalSales || 0,
        gastos: monthData?.gastos || 0,
        mdo: mdo[code] || 0
      };
    });
    
    // Generate HTML
    const html = generateReportHTML(month, { restaurants });
    
    // Save HTML
    const htmlPath = path.join(reportsDir, `${month}-analysis.html`);
    fs.writeFileSync(htmlPath, html);
    
    // Generate PDF using playwright
    const pdfPath = path.join(reportsDir, `${month}-analysis.pdf`);
    
    try {
      execSync(`cd ${process.cwd()} && npx playwright pdf ${htmlPath} ${pdfPath}`, {
        timeout: 30000
      });
    } catch (e) {
      console.error('PDF generation error:', e);
      return new Response('Error generating PDF', { status: 500 });
    }
    
    return redirect('/informes?generated=' + month);
    
  } catch (error) {
    console.error('Report generation error:', error);
    return new Response('Error generating report', { status: 500 });
  }
};
