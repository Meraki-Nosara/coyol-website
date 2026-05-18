const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Collect JS errors
  const jsErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') jsErrors.push(msg.text());
  });
  page.on('pageerror', err => jsErrors.push(err.message));
  
  console.log('Loading admin page...');
  await page.goto('https://reserve.coyolrestaurant.com/admin', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait a bit for JS to execute
  await page.waitForTimeout(2000);
  
  // Check date display
  const dateText = await page.$eval('#currentDate', el => el.textContent).catch(() => 'NOT FOUND');
  console.log('Date shown:', dateText);
  
  // Check reservations count
  const resCount = await page.$eval('#resCount', el => el.textContent).catch(() => 'NOT FOUND');
  console.log('Reservations:', resCount);
  
  // Check zone tabs
  const zones = await page.$$eval('.zone-tab', tabs => tabs.map(t => t.textContent)).catch(() => []);
  console.log('Zones:', zones.join(', '));
  
  // Check if tables rendered
  const tables = await page.$$('.table');
  console.log('Tables rendered:', tables.length);
  
  // Check reservation items
  const resItems = await page.$$('.res-item');
  console.log('Reservation items:', resItems.length);
  
  // Report JS errors
  if (jsErrors.length > 0) {
    console.log('\n❌ JavaScript Errors:');
    jsErrors.forEach(e => console.log('  -', e));
  } else {
    console.log('\n✅ No JavaScript errors');
  }
  
  await browser.close();
  console.log('\n✅ Test complete');
})();
