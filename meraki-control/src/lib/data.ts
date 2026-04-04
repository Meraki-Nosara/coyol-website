import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'sales.json');

export interface DailySale {
  date: string; // YYYY-MM-DD
  restaurant: 'esh' | 'coyol' | 'laluna';
  cash: number;
  card: number;
  sinpe: number;
  total: number;
  source?: string; // e.g., "email_image", "manual"
  parsedAt?: string;
}

export interface SalesData {
  restaurants: {
    [key: string]: {
      name: string;
      color: string;
    };
  };
  daily: DailySale[];
  lastUpdated: string | null;
}

export function loadSalesData(): SalesData {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // Return empty structure if file doesn't exist
    return {
      restaurants: {
        esh: { name: 'Esh Bakery', color: '#C4A67C' },
        coyol: { name: 'Coyol', color: '#3D4F3D' },
        laluna: { name: 'La Luna', color: '#A65D3F' }
      },
      daily: [],
      lastUpdated: null
    };
  }
}

export function saveSalesData(data: SalesData): void {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export function addDailySale(sale: DailySale): void {
  const data = loadSalesData();
  
  // Remove existing entry for same date/restaurant if exists
  data.daily = data.daily.filter(
    s => !(s.date === sale.date && s.restaurant === sale.restaurant)
  );
  
  // Add new entry
  data.daily.push({
    ...sale,
    parsedAt: new Date().toISOString()
  });
  
  // Sort by date descending
  data.daily.sort((a, b) => b.date.localeCompare(a.date));
  
  saveSalesData(data);
}

// Helper functions for dashboard

export function getSalesForDate(date: string): DailySale[] {
  const data = loadSalesData();
  return data.daily.filter(s => s.date === date);
}

export function getSalesForDateRange(start: string, end: string): DailySale[] {
  const data = loadSalesData();
  return data.daily.filter(s => s.date >= start && s.date <= end);
}

export function getSalesByRestaurant(restaurant: string, start?: string, end?: string): DailySale[] {
  const data = loadSalesData();
  let sales = data.daily.filter(s => s.restaurant === restaurant);
  
  if (start) sales = sales.filter(s => s.date >= start);
  if (end) sales = sales.filter(s => s.date <= end);
  
  return sales;
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

export function getWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return getDateString(d);
}

export function getMonthStart(): string {
  const d = new Date();
  d.setDate(1);
  return getDateString(d);
}

export function aggregateSales(sales: DailySale[]): {
  total: number;
  cash: number;
  card: number;
  sinpe: number;
  days: number;
} {
  return {
    total: sales.reduce((sum, s) => sum + s.total, 0),
    cash: sales.reduce((sum, s) => sum + s.cash, 0),
    card: sales.reduce((sum, s) => sum + s.card, 0),
    sinpe: sales.reduce((sum, s) => sum + s.sinpe, 0),
    days: new Set(sales.map(s => s.date)).size
  };
}
