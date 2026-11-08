CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  mp_order_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'PEN',
  total_amount REAL NOT NULL,
  items_json TEXT NOT NULL,
  payment_id TEXT,
  payment_status TEXT,
  payment_detail TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
