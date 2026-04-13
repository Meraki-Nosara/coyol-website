const fs = require('fs');
const path = '/Users/Coyol/.openclaw/workspace/meraki-control/data/monthly.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Q1 2026 payroll breakdown from sales.json
const payroll = {
  '01': {
    laluna: 13111929,
    coyol: 3114822,
    esh: 3230432,
    especial: 3239593,
    fijos: 4710017,
    total: 27406793
  },
  '02': {
    laluna: 10149071,
    coyol: 4033016,
    esh: 3519307,
    especial: 1083315,
    fijos: 4356842,
    total: 23141551
  },
  '03': {
    laluna: 12956542,
    coyol: 1300632,
    esh: 3503654,
    especial: 1039183,
    fijos: 4285172,
    total: 23085183
  }
};

// Q1 2026 sales for proportional allocation of shared costs
const sales2026 = {
  '01': { laluna: 224273757, coyol: 108802015, esh: 18261477 },
  '02': { laluna: 184142134, coyol: 93441010, esh: 16823328 },
  '03': { laluna: 226154347, coyol: 110438993, esh: 16851862 }
};

// Calculate and update MDO for each 2026 month
['01', '02', '03'].forEach(month => {
  const p = payroll[month];
  const s = sales2026[month];
  const totalSales = s.laluna + s.coyol + s.esh;
  
  // Shared costs (especial + fijos) allocated by sales proportion
  const shared = p.especial + p.fijos;
  
  const mdo = {
    laluna: Math.round(p.laluna + (shared * s.laluna / totalSales)),
    coyol: Math.round(p.coyol + (shared * s.coyol / totalSales)),
    esh: Math.round(p.esh + (shared * s.esh / totalSales))
  };
  
  console.log(`2026-${month}:`);
  console.log(`  La Luna: ₡${(mdo.laluna/1000000).toFixed(1)}M (${(mdo.laluna/s.laluna*100).toFixed(1)}%)`);
  console.log(`  Coyol:   ₡${(mdo.coyol/1000000).toFixed(1)}M (${(mdo.coyol/s.coyol*100).toFixed(1)}%)`);
  console.log(`  Esh:     ₡${(mdo.esh/1000000).toFixed(1)}M (${(mdo.esh/s.esh*100).toFixed(1)}%)`);
  console.log(`  Total:   ₡${((mdo.laluna+mdo.coyol+mdo.esh)/1000000).toFixed(1)}M (should be ${(p.total/1000000).toFixed(1)}M)`);
  
  // Update monthly.json
  data.monthly.forEach(m => {
    if (m.month === `2026-${month}`) {
      if (m.restaurant === 'laluna') m.mdo = mdo.laluna;
      if (m.restaurant === 'coyol') m.mdo = mdo.coyol;
      if (m.restaurant === 'esh') m.mdo = mdo.esh;
    }
  });
});

data.lastUpdated = new Date().toISOString();
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('\n✅ Updated monthly.json');
