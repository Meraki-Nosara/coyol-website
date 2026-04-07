#!/usr/bin/env node
/**
 * Factura Electronica Parser for Meraki Control
 * Parses Costa Rica electronic invoices (XML) and extracts:
 * - Invoice totals
 * - Line items with prices (for price comparison)
 * - Supplier information
 */

const fs = require('fs');
const path = require('path');

// Data file paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const FACTURAS_FILE = path.join(DATA_DIR, 'facturas.json');
const SUPPLIERS_FILE = path.join(DATA_DIR, 'suppliers.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Initialize data files if they don't exist
function initDataFiles() {
  if (!fs.existsSync(FACTURAS_FILE)) {
    fs.writeFileSync(FACTURAS_FILE, JSON.stringify({
      facturas: [],
      lastProcessed: null,
      totals: {}
    }, null, 2));
  }
  
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify({
      products: {},
      priceHistory: [],
      metadata: { lastUpdated: null }
    }, null, 2));
  }
}

// Parse XML to extract invoice data
function parseFacturaXML(xmlContent) {
  const extract = (tag) => {
    const match = xmlContent.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
    return match ? match[1].trim() : null;
  };
  
  const extractNested = (parent, child) => {
    const parentMatch = xmlContent.match(new RegExp(`<${parent}>[\\s\\S]*?</${parent}>`));
    if (!parentMatch) return null;
    const childMatch = parentMatch[0].match(new RegExp(`<${child}>([^<]+)</${child}>`));
    return childMatch ? childMatch[1].trim() : null;
  };

  // Get emisor (supplier) info
  const emisorBlock = xmlContent.match(/<Emisor>[\s\S]*?<\/Emisor>/);
  let supplierName = null;
  let supplierId = null;
  
  if (emisorBlock) {
    const nameMatch = emisorBlock[0].match(/<Nombre>([^<]+)<\/Nombre>/);
    const idMatch = emisorBlock[0].match(/<Identificacion>[\s\S]*?<Numero>([^<]+)<\/Numero>/);
    supplierName = nameMatch ? nameMatch[1].trim() : null;
    supplierId = idMatch ? idMatch[1].trim() : null;
  }

  // Extract line items for price tracking
  const lineItems = [];
  const lineMatches = xmlContent.matchAll(/<LineaDetalle>([\s\S]*?)<\/LineaDetalle>/g);
  
  for (const match of lineMatches) {
    const lineXml = match[1];
    const getField = (tag) => {
      const m = lineXml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
      return m ? m[1].trim() : null;
    };
    
    const item = {
      lineNumber: parseInt(getField('NumeroLinea')) || 0,
      cabyCode: getField('CodigoCABYS'),
      productCode: getField('Codigo'),
      description: getField('Detalle'),
      quantity: parseFloat(getField('Cantidad')) || 0,
      unit: getField('UnidadMedida'),
      unitPrice: parseFloat(getField('PrecioUnitario')) || 0,
      total: parseFloat(getField('MontoTotalLinea')) || 0,
      tax: parseFloat(getField('ImpuestoNeto')) || 0
    };
    
    if (item.description && item.unitPrice > 0) {
      lineItems.push(item);
    }
  }

  return {
    clave: extract('Clave'),
    consecutivo: extract('NumeroConsecutivo'),
    fecha: extract('FechaEmision'),
    supplierName,
    supplierId,
    total: parseFloat(extract('TotalComprobante')) || 0,
    subtotal: parseFloat(extract('TotalVentaNeta')) || 0,
    impuesto: parseFloat(extract('TotalImpuesto')) || 0,
    moneda: extractNested('CodigoTipoMoneda', 'CodigoMoneda') || 'CRC',
    lineItems
  };
}

// Load existing data
function loadData() {
  initDataFiles();
  const suppliers = fs.existsSync(SUPPLIERS_FILE) 
    ? JSON.parse(fs.readFileSync(SUPPLIERS_FILE, 'utf8'))
    : { suppliers: {}, mappings: {} };
    
  return {
    facturas: JSON.parse(fs.readFileSync(FACTURAS_FILE, 'utf8')),
    suppliers,
    products: JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'))
  };
}

// Save data
function saveData(data) {
  fs.writeFileSync(FACTURAS_FILE, JSON.stringify(data.facturas, null, 2));
  fs.writeFileSync(SUPPLIERS_FILE, JSON.stringify(data.suppliers, null, 2));
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data.products, null, 2));
}

// Normalize product name for matching
function normalizeProductName(name) {
  return name.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Update product price history
function updateProductPrices(data, factura) {
  if (!factura.lineItems || factura.lineItems.length === 0) return;
  
  const date = factura.fecha ? factura.fecha.substring(0, 10) : new Date().toISOString().substring(0, 10);
  
  factura.lineItems.forEach(item => {
    const normalizedName = normalizeProductName(item.description);
    const productKey = `${factura.supplierId}_${normalizedName}`;
    
    if (!data.products.products[productKey]) {
      data.products.products[productKey] = {
        supplierId: factura.supplierId,
        supplierName: factura.supplierName,
        description: item.description,
        normalizedName,
        cabyCode: item.cabyCode,
        unit: item.unit,
        category: 'unknown',
        prices: []
      };
    }
    
    // Add price record
    data.products.products[productKey].prices.push({
      date,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      invoiceClave: factura.clave
    });
    
    // Add to global price history for trend analysis
    data.products.priceHistory.push({
      date,
      productKey,
      description: item.description,
      supplierId: factura.supplierId,
      unitPrice: item.unitPrice,
      unit: item.unit
    });
  });
  
  data.products.metadata.lastUpdated = new Date().toISOString();
}

// Add a new factura
function addFactura(data, factura) {
  // Check if already exists
  if (data.facturas.facturas.some(f => f.clave === factura.clave)) {
    console.log(`Skipping duplicate: ${factura.clave}`);
    return false;
  }
  
  // Look up restaurant mapping
  let restaurant = 'unknown';
  if (factura.supplierId && data.suppliers.suppliers && data.suppliers.suppliers[factura.supplierId]) {
    restaurant = data.suppliers.suppliers[factura.supplierId].restaurant || 'shared';
  }
  
  // Add supplier if new
  if (factura.supplierId && data.suppliers.suppliers && !data.suppliers.suppliers[factura.supplierId]) {
    data.suppliers.suppliers[factura.supplierId] = {
      name: factura.supplierName,
      shortName: factura.supplierName,
      cedula: factura.supplierId,
      category: 'unknown',
      subcategory: 'unknown',
      restaurant: 'unknown',
      contact: {},
      notes: 'Auto-added from invoice',
      products: {},
      priceHistory: [],
      addedAt: new Date().toISOString().substring(0, 10)
    };
    console.log(`New supplier added: ${factura.supplierName} (${factura.supplierId})`);
  }
  
  // Update product prices
  updateProductPrices(data, factura);
  
  // Add to facturas (without lineItems to save space - they're in products.json)
  const record = {
    clave: factura.clave,
    consecutivo: factura.consecutivo,
    fecha: factura.fecha,
    supplierId: factura.supplierId,
    supplierName: factura.supplierName,
    total: factura.total,
    subtotal: factura.subtotal,
    impuesto: factura.impuesto,
    moneda: factura.moneda,
    restaurant,
    itemCount: factura.lineItems.length,
    processedAt: new Date().toISOString()
  };
  
  data.facturas.facturas.push(record);
  
  // Update totals by month
  const month = factura.fecha ? factura.fecha.substring(0, 7) : 'unknown';
  if (!data.facturas.totals[month]) {
    data.facturas.totals[month] = { total: 0, count: 0, byRestaurant: {}, bySupplier: {} };
  }
  data.facturas.totals[month].total += factura.total;
  data.facturas.totals[month].count += 1;
  
  if (!data.facturas.totals[month].byRestaurant[restaurant]) {
    data.facturas.totals[month].byRestaurant[restaurant] = 0;
  }
  data.facturas.totals[month].byRestaurant[restaurant] += factura.total;
  
  // Track by supplier
  if (!data.facturas.totals[month].bySupplier[factura.supplierId]) {
    data.facturas.totals[month].bySupplier[factura.supplierId] = {
      name: factura.supplierName,
      total: 0,
      count: 0
    };
  }
  data.facturas.totals[month].bySupplier[factura.supplierId].total += factura.total;
  data.facturas.totals[month].bySupplier[factura.supplierId].count += 1;
  
  console.log(`Added: ${factura.supplierName} - ₡${factura.total.toLocaleString()} (${factura.lineItems.length} items)`);
  return true;
}

// Process XML file
function processXMLFile(xmlPath, data) {
  try {
    const content = fs.readFileSync(xmlPath, 'utf8');
    
    // Skip response/acceptance XMLs
    if (content.includes('<MensajeHacienda') || content.includes('<MensajeReceptor')) {
      return false;
    }
    
    const factura = parseFacturaXML(content);
    
    if (factura.clave && factura.total > 0) {
      factura.sourceFile = path.basename(xmlPath);
      return addFactura(data, factura);
    }
  } catch (err) {
    console.error(`Error processing ${xmlPath}: ${err.message}`);
  }
  return false;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const data = loadData();
  
  if (args[0] === '--stats') {
    console.log('\n=== Factura Statistics ===\n');
    console.log(`Total facturas: ${data.facturas.facturas.length}`);
    console.log(`Total suppliers: ${Object.keys(data.suppliers.suppliers || {}).length}`);
    console.log(`Total products tracked: ${Object.keys(data.products.products).length}`);
    console.log(`Price records: ${data.products.priceHistory.length}`);
    console.log('\nTotals by month:');
    Object.entries(data.facturas.totals).sort().forEach(([month, stats]) => {
      console.log(`  ${month}: ₡${stats.total.toLocaleString()} (${stats.count} invoices)`);
    });
    return;
  }
  
  if (args[0] === '--suppliers') {
    console.log('\n=== Suppliers ===\n');
    Object.entries(data.suppliers.suppliers || {}).forEach(([id, s]) => {
      const status = s.restaurant === 'unknown' ? '❓' : '✓';
      console.log(`${status} ${s.shortName || s.name}`);
      console.log(`  ID: ${id} | Category: ${s.category} | Restaurant: ${s.restaurant}`);
    });
    return;
  }
  
  if (args[0] === '--prices') {
    console.log('\n=== Product Prices ===\n');
    const products = Object.values(data.products.products);
    products.slice(0, 20).forEach(p => {
      const latestPrice = p.prices[p.prices.length - 1];
      console.log(`${p.description}`);
      console.log(`  Supplier: ${p.supplierName}`);
      console.log(`  Latest: ₡${latestPrice?.unitPrice?.toLocaleString()} per ${p.unit}`);
      console.log(`  Records: ${p.prices.length}`);
      console.log('');
    });
    return;
  }
  
  if (args[0] === '--top-suppliers') {
    const month = args[1] || Object.keys(data.facturas.totals).sort().pop();
    const monthData = data.facturas.totals[month];
    if (!monthData) {
      console.log(`No data for month: ${month}`);
      return;
    }
    console.log(`\n=== Top Suppliers for ${month} ===\n`);
    const sorted = Object.entries(monthData.bySupplier)
      .sort((a, b) => b[1].total - a[1].total);
    sorted.forEach(([id, s], i) => {
      console.log(`${i + 1}. ${s.name}`);
      console.log(`   ₡${s.total.toLocaleString()} (${s.count} invoices)`);
    });
    return;
  }
  
  // Process XML files from arguments or Downloads folder
  let xmlFiles = args.filter(f => f.endsWith('.xml'));
  
  if (xmlFiles.length === 0) {
    // Look for unprocessed XMLs in Downloads
    const downloads = path.join(process.env.HOME, 'Downloads');
    xmlFiles = fs.readdirSync(downloads)
      .filter(f => f.endsWith('.xml') && f.includes('506') && !f.includes('_respuesta') && !f.includes('_aceptacion'))
      .map(f => path.join(downloads, f));
  }
  
  let added = 0;
  xmlFiles.forEach(xmlFile => {
    if (processXMLFile(xmlFile, data)) {
      added++;
    }
  });
  
  if (added > 0) {
    data.facturas.lastProcessed = new Date().toISOString();
    saveData(data);
    console.log(`\nProcessed ${added} new facturas`);
    console.log(`Total products tracked: ${Object.keys(data.products.products).length}`);
  } else {
    console.log('No new facturas to process');
  }
}

main();
