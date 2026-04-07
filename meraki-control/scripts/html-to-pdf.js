const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function convertToPdf() {
  const reportsDir = path.join(__dirname, '../public/reports');
  const htmlFiles = fs.readdirSync(reportsDir).filter(f => f.endsWith('.html'));
  
  console.log(`Found ${htmlFiles.length} HTML files to convert...`);
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(reportsDir, htmlFile);
    const pdfPath = htmlPath.replace('.html', '.pdf');
    
    // Skip if PDF already exists and is newer than HTML
    if (fs.existsSync(pdfPath)) {
      const htmlStat = fs.statSync(htmlPath);
      const pdfStat = fs.statSync(pdfPath);
      if (pdfStat.mtime > htmlStat.mtime) {
        console.log(`⏭️  Skipping ${htmlFile} (PDF up to date)`);
        continue;
      }
    }
    
    try {
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true
      });
      console.log(`✅ ${htmlFile} → ${path.basename(pdfPath)}`);
    } catch (err) {
      console.error(`❌ Failed: ${htmlFile}`, err.message);
    }
  }
  
  await browser.close();
  console.log('\n✅ Done!');
}

convertToPdf().catch(console.error);
