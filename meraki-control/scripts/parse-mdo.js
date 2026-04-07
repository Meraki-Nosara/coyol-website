#!/usr/bin/env node
/**
 * MDO (Labor) Parser for Meraki Control
 * Extracts Salario Bruto by restaurant from Abner's Excel files
 * Restaurant is determined by SHEET NAME (LA LUNA, COYOL, ESH tabs)
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MDO_FILE = path.join(DATA_DIR, 'mdo.json');

// Sheet name to restaurant mapping
const SHEET_TO_RESTAURANT = {
  'LA LUNA': 'laluna',
  'LALUNA': 'laluna',
  'LUNA': 'laluna',
  'COYOL': 'coyol',
  'ESH': 'esh',
  'ESPECIAL': 'skip', // Skip this sheet
  'FIJOS': 'skip',
};

// Month name to number
const MONTH_MAP = {
  'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
  'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
  'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12',
  'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04',
  'MAY': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
  'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12'
};

// Extract month/year from filename
function parseFilename(filename) {
  const upper = filename.toUpperCase();
  
  // Try to find year
  const yearMatch = upper.match(/20(\d{2})/);
  const year = yearMatch ? `20${yearMatch[1]}` : '2025';
  
  // Try to find month
  let month = null;
  for (const [name, num] of Object.entries(MONTH_MAP)) {
    if (upper.includes(name)) {
      month = num;
      break;
    }
  }
  
  return { year, month };
}

// Find column index by header name
function findColumn(headerRow, ...names) {
  if (!headerRow) return -1;
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').toUpperCase().trim();
    for (const name of names) {
      if (cell.includes(name)) return i;
    }
  }
  return -1;
}

// Parse a single sheet
function parseSheet(sheet, sheetName) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  // Find header row (look for "Salario Bruto" or employee name column)
  let headerRowIdx = -1;
  let salarioBrutoCol = -1;
  
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (!row) continue;
    
    const colIdx = findColumn(row, 'SALARIO BRUTO', 'SAL BRUTO', 'BRUTO');
    if (colIdx >= 0) {
      headerRowIdx = i;
      salarioBrutoCol = colIdx;
      break;
    }
  }
  
  if (salarioBrutoCol < 0) {
    // Try to find by position - often it's in a specific column
    // Look for numeric totals at the bottom
    return 0;
  }
  
  // Sum all Salario Bruto values
  let total = 0;
  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    const value = row[salarioBrutoCol];
    if (value === undefined || value === '') continue;
    
    // Skip if it looks like a header or total row
    const firstCell = String(row[0] || '').toUpperCase();
    if (firstCell.includes('TOTAL') || firstCell.includes('SUBTOTAL')) continue;
    
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[,\s]/g, ''));
    if (!isNaN(num) && num > 0) {
      total += num;
    }
  }
  
  return total;
}

// Parse a single Excel file
function parseExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const results = { laluna: 0, coyol: 0, esh: 0 };
    
    for (const sheetName of workbook.SheetNames) {
      const upperSheet = sheetName.toUpperCase().trim();
      
      // Determine restaurant from sheet name
      let restaurant = null;
      for (const [key, value] of Object.entries(SHEET_TO_RESTAURANT)) {
        if (upperSheet.includes(key) || upperSheet === key) {
          restaurant = value;
          break;
        }
      }
      
      if (!restaurant || restaurant === 'skip') {
        continue;
      }
      
      const sheet = workbook.Sheets[sheetName];
      const total = parseSheet(sheet, sheetName);
      
      if (total > 0) {
        results[restaurant] += total;
      }
    }
    
    return results;
  } catch (err) {
    console.error(`Error parsing ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  // Load existing MDO data or start fresh
  let mdoData = { months: {}, lastUpdated: null, files: [] };
  
  // Always start fresh to avoid duplicates
  if (args[0] !== '--append') {
    mdoData = { months: {}, lastUpdated: null, files: [] };
  } else if (fs.existsSync(MDO_FILE)) {
    mdoData = JSON.parse(fs.readFileSync(MDO_FILE, 'utf8'));
  }
  
  if (args[0] === '--stats') {
    if (fs.existsSync(MDO_FILE)) {
      mdoData = JSON.parse(fs.readFileSync(MDO_FILE, 'utf8'));
    }
    console.log('\n=== MDO Statistics (Salario Bruto) ===\n');
    const months = Object.keys(mdoData.months).sort();
    let grandTotal = { laluna: 0, coyol: 0, esh: 0 };
    
    months.forEach(month => {
      const m = mdoData.months[month];
      const total = (m.laluna || 0) + (m.coyol || 0) + (m.esh || 0);
      console.log(`${month}: ₡${Math.round(total).toLocaleString()}`);
      console.log(`  La Luna: ₡${Math.round(m.laluna || 0).toLocaleString()}`);
      console.log(`  Coyol:   ₡${Math.round(m.coyol || 0).toLocaleString()}`);
      console.log(`  Esh:     ₡${Math.round(m.esh || 0).toLocaleString()}`);
      grandTotal.laluna += m.laluna || 0;
      grandTotal.coyol += m.coyol || 0;
      grandTotal.esh += m.esh || 0;
    });
    
    console.log(`\n=== Totals ===`);
    console.log(`La Luna: ₡${Math.round(grandTotal.laluna).toLocaleString()}`);
    console.log(`Coyol:   ₡${Math.round(grandTotal.coyol).toLocaleString()}`);
    console.log(`Esh:     ₡${Math.round(grandTotal.esh).toLocaleString()}`);
    console.log(`TOTAL:   ₡${Math.round(grandTotal.laluna + grandTotal.coyol + grandTotal.esh).toLocaleString()}`);
    console.log(`\nFiles processed: ${mdoData.files.length}`);
    return;
  }
  
  // Find all SALARIOS Excel files
  const downloadsDir = path.join(process.env.HOME, 'Downloads');
  const files = fs.readdirSync(downloadsDir)
    .filter(f => f.toUpperCase().startsWith('SALARIOS') && f.endsWith('.xlsx'))
    .map(f => path.join(downloadsDir, f));
  
  console.log(`Found ${files.length} MDO files\n`);
  
  // Process each file
  for (const file of files) {
    const filename = path.basename(file);
    
    const { year, month } = parseFilename(filename);
    if (!month) {
      console.log(`⚠ Could not determine month: ${filename}`);
      continue;
    }
    
    const monthKey = `${year}-${month}`;
    console.log(`Processing: ${filename}`);
    
    const results = parseExcelFile(file);
    if (!results) continue;
    
    const fileTotal = results.laluna + results.coyol + results.esh;
    if (fileTotal === 0) {
      console.log(`  → No data found`);
      continue;
    }
    
    console.log(`  → ${monthKey}: La Luna ₡${Math.round(results.laluna).toLocaleString()} | Coyol ₡${Math.round(results.coyol).toLocaleString()} | Esh ₡${Math.round(results.esh).toLocaleString()}`);
    
    // Add to monthly totals
    if (!mdoData.months[monthKey]) {
      mdoData.months[monthKey] = { laluna: 0, coyol: 0, esh: 0 };
    }
    
    mdoData.months[monthKey].laluna += results.laluna;
    mdoData.months[monthKey].coyol += results.coyol;
    mdoData.months[monthKey].esh += results.esh;
    
    mdoData.files.push(filename);
  }
  
  // Save
  mdoData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MDO_FILE, JSON.stringify(mdoData, null, 2));
  
  console.log('\n=== Monthly Summary (Salario Bruto) ===\n');
  const months = Object.keys(mdoData.months).sort();
  months.forEach(month => {
    const m = mdoData.months[month];
    const total = (m.laluna || 0) + (m.coyol || 0) + (m.esh || 0);
    console.log(`${month}: ₡${Math.round(total).toLocaleString()} (Luna: ${Math.round(m.laluna/1000)}K, Coyol: ${Math.round(m.coyol/1000)}K, Esh: ${Math.round(m.esh/1000)}K)`);
  });
  
  console.log(`\nSaved to ${MDO_FILE}`);
}

main();
