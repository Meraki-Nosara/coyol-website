const fs = require('fs');

// Read source of truth from coyol-control
const controlData = JSON.parse(fs.readFileSync(
  '/Users/Coyol/.openclaw/workspace/coyol-control/src/data/mar-azul-lots.json', 
  'utf8'
));

// Read public website data (has coordinates we want to keep)
const publicData = JSON.parse(fs.readFileSync(
  '/Users/Coyol/.openclaw/workspace/coyol-website/public/data/mar-azul-structured.json',
  'utf8'
));

// Create lookup from control data
const controlLots = {};
controlData.lots.forEach(lot => {
  controlLots[lot.number] = lot;
});

// Update public data with correct info from control
publicData.lots = publicData.lots.map(pubLot => {
  const ctrlLot = controlLots[pubLot.lotNumber];
  if (ctrlLot) {
    // Map status
    let status = 'available';
    if (ctrlLot.status === 'Habitada') status = 'sold';
    else if (ctrlLot.status === 'Reserved') status = 'reserved';
    else if (ctrlLot.status === 'In Progress') status = 'construction';
    else if (ctrlLot.status === 'Available') status = 'available';
    
    return {
      ...pubLot,
      areaM2: Math.round(ctrlLot.area),
      status: status,
      houseName: ctrlLot.houseName || null
    };
  }
  return pubLot;
});

publicData.generatedAt = new Date().toISOString().split('T')[0];
publicData.syncedFrom = 'coyol-control';

// Write back
fs.writeFileSync(
  '/Users/Coyol/.openclaw/workspace/coyol-website/public/data/mar-azul-structured.json',
  JSON.stringify(publicData, null, 2)
);

// Summary
const sold = publicData.lots.filter(l => l.status === 'sold').length;
const available = publicData.lots.filter(l => l.status === 'available').length;
const other = publicData.lots.length - sold - available;

console.log(`✅ Synced ${publicData.lots.length} lots`);
console.log(`   Sold: ${sold}`);
console.log(`   Available: ${available}`);
console.log(`   Other: ${other}`);
