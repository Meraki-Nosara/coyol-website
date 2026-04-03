-- Meraki Control System Database Schema
-- SQLite

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,  -- 'laluna', 'coyol', 'esh'
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily Sales (main input)
CREATE TABLE IF NOT EXISTS daily_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    date DATE NOT NULL,
    cash_sales DECIMAL(10,2) DEFAULT 0,
    card_sales DECIMAL(10,2) DEFAULT 0,
    transfer_sales DECIMAL(10,2) DEFAULT 0,
    customer_count INTEGER DEFAULT 0,
    notes TEXT,
    entered_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    UNIQUE(restaurant_id, date)
);

-- Suppliers/Vendors
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    category TEXT,  -- 'seafood', 'meat', 'produce', 'beverages', 'dry goods', etc.
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products (items purchased)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,  -- 'protein', 'produce', 'dairy', 'dry goods', 'beverages', etc.
    unit TEXT,      -- 'kg', 'lb', 'unit', 'liter', 'case', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Prices (track price history)
CREATE TABLE IF NOT EXISTS supplier_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT,
    effective_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Purchases (actual invoices/receipts)
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    date DATE NOT NULL,
    invoice_number TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,  -- 'cash', 'transfer', 'credit', etc.
    payment_status TEXT DEFAULT 'pending',  -- 'pending', 'paid'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Purchase Items (line items per invoice)
CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Labor/Staff Costs
CREATE TABLE IF NOT EXISTS labor_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    date DATE NOT NULL,
    total_hours DECIMAL(6,2),
    total_cost DECIMAL(10,2) NOT NULL,
    staff_count INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    UNIQUE(restaurant_id, date)
);

-- Expenses (non-supplier costs)
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,  -- 'utilities', 'rent', 'maintenance', 'supplies', 'marketing', etc.
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Seasonal Patterns (for AI recommendations)
CREATE TABLE IF NOT EXISTS seasonal_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,  -- NULL for all restaurants
    month INTEGER NOT NULL,  -- 1-12
    week_of_month INTEGER,   -- 1-5, NULL for monthly patterns
    avg_daily_revenue DECIMAL(10,2),
    avg_customer_count INTEGER,
    avg_labor_percent DECIMAL(5,2),
    notes TEXT,
    year_analyzed INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations (generated insights)
CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,  -- NULL for all restaurants
    type TEXT NOT NULL,  -- 'labor', 'inventory', 'supplier', 'pricing', 'general'
    priority TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'urgent'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    potential_savings DECIMAL(10,2),
    status TEXT DEFAULT 'pending',  -- 'pending', 'implemented', 'dismissed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(date);
CREATE INDEX IF NOT EXISTS idx_daily_sales_restaurant ON daily_sales(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_date ON supplier_prices(effective_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Initial data: Insert restaurants
INSERT OR IGNORE INTO restaurants (name, code, location) VALUES 
    ('La Luna', 'laluna', 'Nosara'),
    ('Coyol', 'coyol', 'Nosara'),
    ('Esh', 'esh', 'Nosara');

-- Common product categories
INSERT OR IGNORE INTO products (name, category, unit) VALUES
    ('Chicken', 'protein', 'kg'),
    ('Beef', 'protein', 'kg'),
    ('Shrimp', 'seafood', 'kg'),
    ('Fish (Mahi)', 'seafood', 'kg'),
    ('Fish (Tuna)', 'seafood', 'kg'),
    ('Octopus', 'seafood', 'kg'),
    ('Tomatoes', 'produce', 'kg'),
    ('Onions', 'produce', 'kg'),
    ('Lettuce', 'produce', 'unit'),
    ('Avocado', 'produce', 'unit'),
    ('Limes', 'produce', 'kg'),
    ('Rice', 'dry goods', 'kg'),
    ('Beans', 'dry goods', 'kg'),
    ('Cooking Oil', 'dry goods', 'liter'),
    ('Beer (Imperial)', 'beverages', 'case'),
    ('Beer (Pilsen)', 'beverages', 'case'),
    ('Wine (House Red)', 'beverages', 'bottle'),
    ('Wine (House White)', 'beverages', 'bottle'),
    ('Rum', 'beverages', 'bottle'),
    ('Vodka', 'beverages', 'bottle');
