const { chromium } = require('playwright');

async function generatePDF() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const weeklyHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Helvetica, Arial, sans-serif; margin: 40px; color: #1A1F16; background: white; }
      .header { text-align: center; border-bottom: 3px solid #4A5D4A; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #3D4F3D; font-size: 36px; margin: 0; letter-spacing: 4px; }
      .header p { color: #666; margin: 10px 0 0; }
      .week-badge { background: #3D4F3D; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-size: 12px; }
      .total-box { background: linear-gradient(135deg, #3D4F3D 0%, #4A5D4A 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
      .total-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
      .total-box .amount { font-size: 42px; font-weight: bold; margin: 10px 0; }
      .total-box .usd { font-size: 16px; opacity: 0.8; }
      .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 25px 0 15px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
      .day-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
      .day-row:last-child { border-bottom: none; }
      .day-name { color: #666; }
      .day-total { font-weight: bold; font-size: 18px; }
      .restaurant-row { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f9f9f9; border-radius: 8px; margin-bottom: 10px; }
      .restaurant-name { display: flex; align-items: center; gap: 12px; }
      .color-dot { width: 12px; height: 12px; border-radius: 50%; }
      .restaurant-amount { font-weight: bold; font-size: 18px; }
      .note { font-size: 11px; color: #888; text-align: center; margin-top: 20px; font-style: italic; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>MERAKI</h1>
      <p>Weekly Sales Report</p>
      <div class="week-badge">Week of March 30 — April 5, 2026</div>
    </div>
    
    <div class="total-box">
      <div class="label">Week Total</div>
      <div class="amount">₡16,519,636</div>
      <div class="usd">≈ $32,712 USD</div>
    </div>
    
    <div class="section-title">Daily Breakdown</div>
    <div class="day-row">
      <div class="day-name">Saturday, Apr 4</div>
      <div class="day-total">₡14,532,636 ✓</div>
    </div>
    <div class="day-row">
      <div class="day-name">Friday, Apr 3</div>
      <div class="day-total">₡1,987,000 *</div>
    </div>
    <div class="day-row">
      <div class="day-name">Thursday, Apr 2</div>
      <div class="day-total">₡2,020,000 *</div>
    </div>
    <div class="day-row">
      <div class="day-name">Wednesday, Apr 1</div>
      <div class="day-total">₡1,815,000 *</div>
    </div>
    
    <div class="section-title">By Restaurant (April 4)</div>
    <div class="restaurant-row">
      <div class="restaurant-name">
        <div class="color-dot" style="background: #A65D3F;"></div>
        <span>La Luna</span>
      </div>
      <div class="restaurant-amount">₡9,599,590</div>
    </div>
    <div class="restaurant-row">
      <div class="restaurant-name">
        <div class="color-dot" style="background: #3D4F3D;"></div>
        <span>Coyol</span>
      </div>
      <div class="restaurant-amount">₡4,228,519</div>
    </div>
    <div class="restaurant-row">
      <div class="restaurant-name">
        <div class="color-dot" style="background: #C4A67C;"></div>
        <span>Esh</span>
      </div>
      <div class="restaurant-amount">₡704,527</div>
    </div>
    
    <div class="note">* Sample data — waiting for daily closing images from Ingrid</div>
    
    <div class="footer">
      Dashboard: https://sea-lion-app-9kpar.ondigitalocean.app
    </div>
  </body>
  </html>`;
  
  await page.setContent(weeklyHTML);
  await page.pdf({ path: '/tmp/meraki-weekly.pdf', format: 'Letter', printBackground: true });
  
  await browser.close();
  console.log('Weekly PDF generated at /tmp/meraki-weekly.pdf');
}

generatePDF();
