const { chromium } = require('playwright');

async function generatePDF() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const dailyHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Helvetica, Arial, sans-serif; margin: 40px; color: #1A1F16; }
      .header { text-align: center; border-bottom: 3px solid #3D4F3D; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #3D4F3D; font-size: 36px; margin: 0; letter-spacing: 4px; }
      .header p { color: #666; margin: 10px 0 0; }
      .total-box { background: #3D4F3D; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
      .total-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
      .total-box .amount { font-size: 42px; font-weight: bold; margin: 10px 0; }
      .total-box .usd { font-size: 16px; opacity: 0.8; }
      .restaurant { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 15px; display: flex; align-items: center; }
      .color-bar { width: 6px; height: 60px; border-radius: 3px; margin-right: 20px; }
      .info { flex: 1; }
      .name { font-size: 20px; font-weight: bold; }
      .cashier { color: #666; font-size: 12px; margin-top: 4px; }
      .amounts { text-align: right; }
      .amounts .total { font-size: 24px; font-weight: bold; }
      .amounts .breakdown { font-size: 11px; color: #888; margin-top: 4px; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>MERAKI</h1>
      <p>Daily Sales Report — Saturday, April 4, 2026</p>
    </div>
    <div class="total-box">
      <div class="label">Total Sales</div>
      <div class="amount">₡14,532,636</div>
      <div class="usd">≈ $28,777 USD</div>
    </div>
    <div class="restaurant">
      <div class="color-bar" style="background: #A65D3F;"></div>
      <div class="info">
        <div class="name">La Luna</div>
        <div class="cashier">Cashier: Julia Arrieta</div>
      </div>
      <div class="amounts">
        <div class="total">₡9,599,590</div>
        <div class="breakdown">Card ₡8,967,590 • Cash ₡632,000</div>
      </div>
    </div>
    <div class="restaurant">
      <div class="color-bar" style="background: #3D4F3D;"></div>
      <div class="info">
        <div class="name">Coyol</div>
        <div class="cashier">Cashier: John Freiser</div>
      </div>
      <div class="amounts">
        <div class="total">₡4,228,519</div>
        <div class="breakdown">Card ₡4,071,731 • Cash ₡156,788</div>
      </div>
    </div>
    <div class="restaurant">
      <div class="color-bar" style="background: #C4A67C;"></div>
      <div class="info">
        <div class="name">Esh</div>
        <div class="cashier">Cashier: Raul Rodriguez</div>
      </div>
      <div class="amounts">
        <div class="total">₡704,527</div>
        <div class="breakdown">Card ₡574,827 • Cash ₡129,700</div>
      </div>
    </div>
    <div class="footer">
      Dashboard: https://sea-lion-app-9kpar.ondigitalocean.app
    </div>
  </body>
  </html>`;
  
  await page.setContent(dailyHTML);
  await page.pdf({ path: '/tmp/meraki-daily-apr4.pdf', format: 'Letter', printBackground: true });
  
  await browser.close();
  console.log('Daily PDF generated at /tmp/meraki-daily-apr4.pdf');
}

generatePDF();
