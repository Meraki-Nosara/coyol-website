const { chromium } = require('playwright');

async function generatePDF() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const monthlyHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Helvetica, Arial, sans-serif; margin: 40px; color: #1A1F16; background: white; }
      .header { text-align: center; border-bottom: 3px solid #C4A67C; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #3D4F3D; font-size: 36px; margin: 0; letter-spacing: 4px; }
      .header p { color: #666; margin: 10px 0 0; font-size: 18px; }
      .total-box { background: linear-gradient(135deg, #1A1F16 0%, #2a2f26 100%); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
      .total-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #C4A67C; }
      .total-box .amount { font-size: 48px; font-weight: bold; margin: 10px 0; color: #C4A67C; }
      .total-box .usd { font-size: 18px; opacity: 0.8; }
      .restaurant-card { border: 1px solid #ddd; border-radius: 12px; padding: 25px; margin-bottom: 20px; }
      .restaurant-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
      .restaurant-name { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: bold; }
      .color-bar { width: 6px; height: 30px; border-radius: 3px; }
      .restaurant-total { font-size: 26px; font-weight: bold; }
      .restaurant-pct { font-size: 14px; color: #888; margin-left: 8px; }
      .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .stat { background: #f9f9f9; padding: 15px; border-radius: 8px; }
      .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
      .stat-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
      .q1-box { background: #3D4F3D; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px; }
      .q1-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
      .q1-amount { font-size: 28px; font-weight: bold; margin-top: 5px; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>MERAKI</h1>
      <p>Monthly Report — March 2026</p>
    </div>
    
    <div class="total-box">
      <div class="label">Total Revenue</div>
      <div class="amount">₡353,445,202</div>
      <div class="usd">≈ $699,891 USD</div>
    </div>
    
    <div class="restaurant-card">
      <div class="restaurant-header">
        <div class="restaurant-name">
          <div class="color-bar" style="background: #A65D3F;"></div>
          La Luna
        </div>
        <div>
          <span class="restaurant-total">₡226,154,347</span>
          <span class="restaurant-pct">(64%)</span>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-label">Food</div>
          <div class="stat-value">₡133,445,358</div>
        </div>
        <div class="stat">
          <div class="stat-label">Bar</div>
          <div class="stat-value">₡92,708,988</div>
        </div>
        <div class="stat">
          <div class="stat-label">Service Tax</div>
          <div class="stat-value">₡22,079,778</div>
        </div>
        <div class="stat">
          <div class="stat-label">IVA 13%</div>
          <div class="stat-value">₡29,175,498</div>
        </div>
      </div>
    </div>
    
    <div class="restaurant-card">
      <div class="restaurant-header">
        <div class="restaurant-name">
          <div class="color-bar" style="background: #3D4F3D;"></div>
          Coyol
        </div>
        <div>
          <span class="restaurant-total">₡110,438,993</span>
          <span class="restaurant-pct">(31%)</span>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-label">Food</div>
          <div class="stat-value">₡65,665,300</div>
        </div>
        <div class="stat">
          <div class="stat-label">Bar</div>
          <div class="stat-value">₡44,773,693</div>
        </div>
        <div class="stat">
          <div class="stat-label">Customers</div>
          <div class="stat-value">3,163</div>
        </div>
        <div class="stat">
          <div class="stat-label">Orders</div>
          <div class="stat-value">843</div>
        </div>
      </div>
    </div>
    
    <div class="restaurant-card">
      <div class="restaurant-header">
        <div class="restaurant-name">
          <div class="color-bar" style="background: #C4A67C;"></div>
          Esh
        </div>
        <div>
          <span class="restaurant-total">₡16,851,862</span>
          <span class="restaurant-pct">(5%)</span>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-label">Food</div>
          <div class="stat-value">₡10,537,168</div>
        </div>
        <div class="stat">
          <div class="stat-label">Bar</div>
          <div class="stat-value">₡6,314,694</div>
        </div>
        <div class="stat">
          <div class="stat-label">Customers</div>
          <div class="stat-value">1,856</div>
        </div>
        <div class="stat">
          <div class="stat-label">Orders</div>
          <div class="stat-value">1,916</div>
        </div>
      </div>
    </div>
    
    <div class="q1-box">
      <div class="q1-label">Q1 2026 Total (Jan–Mar)</div>
      <div class="q1-amount">₡999,189,924 (~$1.98M USD)</div>
    </div>
    
    <div class="footer">
      Dashboard: https://sea-lion-app-9kpar.ondigitalocean.app
    </div>
  </body>
  </html>`;
  
  await page.setContent(monthlyHTML);
  await page.pdf({ path: '/tmp/meraki-monthly-march.pdf', format: 'Letter', printBackground: true });
  
  await browser.close();
  console.log('Monthly PDF generated at /tmp/meraki-monthly-march.pdf');
}

generatePDF();
