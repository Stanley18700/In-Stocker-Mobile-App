import { Platform } from 'react-native';

interface LocalDB {
  execSync(sql: string): void;
  runSync(sql: string, params?: any[]): { lastInsertRowId: number, changes: number };
  getFirstSync<T>(sql: string, params?: any[]): T | null;
  getAllSync<T>(sql: string, params?: any[]): T[];
  withTransactionSync(callback: () => void): void;
}

const db: LocalDB = {
  execSync: (sql: string) => console.log('Mock execSync:', sql),
  runSync: (sql: string, params?: any[]) => { return { lastInsertRowId: 1, changes: 1 }; },
  getFirstSync: <T>(): T | null => null,
  getAllSync: <T>(): T[] => [],
  withTransactionSync: (callback: () => any) => callback(),
};

export { db };

// ---------------------------------------------------------------------------
// initDatabase — call once on app startup (in AppNavigator or App.tsx)
// Creates all tables if they don't already exist.
// ---------------------------------------------------------------------------

export function initDatabase(): void {
  if (Platform.OS === 'web') return; // Skip init on web

  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Users table (local auth)
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      shop_name   TEXT NOT NULL DEFAULT 'My Shop',
      owner_name  TEXT NOT NULL DEFAULT 'Owner',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name                TEXT NOT NULL,
      sku                 TEXT NOT NULL,
      price               REAL NOT NULL CHECK(price >= 0),
      quantity            INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      category            TEXT,
      is_active           INTEGER NOT NULL DEFAULT 1,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, sku)
    );

    -- Sales table
    CREATE TABLE IF NOT EXISTS sales (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_amount REAL NOT NULL CHECK(total_amount >= 0),
      note         TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sale items table
    CREATE TABLE IF NOT EXISTS sale_items (
      id           TEXT PRIMARY KEY,
      sale_id      TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id   TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity     INTEGER NOT NULL CHECK(quantity > 0),
      unit_price   REAL NOT NULL CHECK(unit_price >= 0),
      subtotal     REAL NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
