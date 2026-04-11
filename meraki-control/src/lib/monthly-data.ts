import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'monthly.json');
const SALES_PATH = path.join(process.cwd(), 'data', 'sales.json');

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

// Daily sale from sales.json
export interface DailySale {
  date: string; // YYYY-MM-DD
  restaurant: 'esh' | 'coyol' | 'laluna';
  total: number;
  netSales: number;
  cash: number;
  card: number;
  food?: number;
  bar?: number;
  source?: string;
}

// Load daily sales from sales.json
export function loadDailySales(): DailySale[] {
  try {
    const raw = fs.readFileSync(SALES_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return data.daily2026 || [];
  } catch {
    return [];
  }
}

// Get daily totals by restaurant for current year
export function getDailyTotals(): { restaurant: string; total: number; cash: number; card: number; food: number; bar: number; days: number }[] {
  const daily = loadDailySales();
  const restaurants = ['esh', 'coyol', 'laluna'];
  
  return restaurants.map(code => {
    const restDaily = daily.filter(d => d.restaurant === code);
    return {
      restaurant: code,
      total: restDaily.reduce((sum, d) => sum + d.total, 0),
      cash: restDaily.reduce((sum, d) => sum + d.cash, 0),
      card: restDaily.reduce((sum, d) => sum + d.card, 0),
      food: restDaily.reduce((sum, d) => sum + (d.food || 0), 0),
      bar: restDaily.reduce((sum, d) => sum + (d.bar || 0), 0),
      days: restDaily.length
    };
  });
}

// Get all daily sales (for charts, etc.)
export function getDailySalesByDate(): { date: string; total: number; restaurants: { [key: string]: number } }[] {
  const daily = loadDailySales();
  const byDate: { [date: string]: { total: number; restaurants: { [key: string]: number } } } = {};
  
  daily.forEach(d => {
    if (!byDate[d.date]) {
      byDate[d.date] = { total: 0, restaurants: {} };
    }
    byDate[d.date].total += d.total;
    byDate[d.date].restaurants[d.restaurant] = d.total;
  });
  
  return Object.entries(byDate)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Get last updated timestamp from sales.json
export function getLastUpdated(): string | null {
  try {
    const raw = fs.readFileSync(SALES_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return data.lastUpdated || null;
  } catch {
    return null;
  }
}
