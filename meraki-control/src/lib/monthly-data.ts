import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'monthly.json');

export interface MonthlySale {
  month: string; // YYYY-MM
  restaurant: 'esh' | 'coyol' | 'laluna';
  totalSales: number;
  food: number;
  bar: number;
  cash: number;
  card: number;
  orders: number;
  customers: number;
  discounts: number;
  serviceTax: number;
  iva: number;
  netReceipts: number;
  avgOrder: number;
  perPerson: number;
  source?: string;
}

export interface MonthlyData {
  restaurants: {
    [key: string]: {
      name: string;
      color: string;
    };
  };
  monthly: MonthlySale[];
  lastUpdated: string | null;
}

export function loadMonthlyData(): MonthlyData {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      restaurants: {
        esh: { name: 'Esh Bakery', color: '#C4A67C' },
        coyol: { name: 'Coyol', color: '#3D4F3D' },
        laluna: { name: 'La Luna', color: '#A65D3F' }
      },
      monthly: [],
      lastUpdated: null
    };
  }
}

export function saveMonthlyData(data: MonthlyData): void {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export function getMonthlyByRestaurant(restaurant: string): MonthlySale[] {
  const data = loadMonthlyData();
  return data.monthly
    .filter(m => m.restaurant === restaurant)
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getMonthlyByMonth(month: string): MonthlySale[] {
  const data = loadMonthlyData();
  return data.monthly.filter(m => m.month === month);
}

export function getAllMonths(): string[] {
  const data = loadMonthlyData();
  const months = [...new Set(data.monthly.map(m => m.month))];
  return months.sort();
}

export function getYearData(year: string): MonthlySale[] {
  const data = loadMonthlyData();
  return data.monthly
    .filter(m => m.month.startsWith(year))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Exchange rate (approximate - update as needed)
export const USD_RATE = 505; // 1 USD = 505 CRC

export function formatCurrency(amount: number, currency: 'CRC' | 'USD' = 'CRC'): string {
  if (currency === 'USD') {
    const usd = amount / USD_RATE;
    if (usd >= 1000000) {
      return `$${(usd / 1000000).toFixed(1)}M`;
    } else if (usd >= 1000) {
      return `$${(usd / 1000).toFixed(0)}K`;
    }
    return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  
  // CRC (Colones)
  if (amount >= 1000000) {
    return `₡${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₡${(amount / 1000).toFixed(0)}K`;
  }
  return `₡${amount.toLocaleString()}`;
}

// Legacy function for backwards compatibility
export function formatColones(amount: number): string {
  return formatCurrency(amount, 'CRC');
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(m) - 1]} ${year}`;
}
