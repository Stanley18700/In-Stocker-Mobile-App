import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Single shared database connection — import this in all service files.
// ---------------------------------------------------------------------------

// Define an interface compatible with what we use from expo-sqlite
interface LocalDB {
  execSync(sql: string): void;
  runSync(sql: string, params?: any[]): { lastInsertRowId: number, changes: number };
  getFirstSync<T>(sql: string, params?: any[]): T | null;
  getAllSync<T>(sql: string, params?: any[]): T[];
  withTransactionSync(callback: () => void): void;
}

let db: LocalDB;

if (Platform.OS === 'web') {
  console.warn("Running on Web: SQLite is not supported locally. Using mock DB.");
  db = {
    execSync: (sql: string) => console.log('Mock execSync:', sql),
    runSync: (sql: string, params: any[]) => {
      console.log('Mock runSync:', sql, params);
      return { lastInsertRowId: 1, changes: 1 };
    },
    getFirstSync: <T>(sql: string, params: any[]): T | null => {
      console.log('Mock getFirstSync:', sql, params);
      // Return a fake user for login so the app is usable
      if (sql.includes('FROM users')) {
        return {
          id: 'demo-user-id',
          email: 'demo@example.com',
          password: 'hashed-password',
          shop_name: 'Web Demo Shop',
          owner_name: 'Web User',
          created_at: new Date().toISOString()
        } as unknown as T;
      }
      return null;
    },
    getAllSync: <T>(sql: string, params: any[]): T[] => {
      console.log('Mock getAllSync:', sql, params);
      if (sql.includes('FROM products')) {
        return [
          { id: '1', name: 'Web Demo Product', sku: 'WEB-001', price: 100, quantity: 50, low_stock_threshold: 5 }
        ] as unknown as T[];
      }
      return [];
    },
    withTransactionSync: (callback: () => any) => callback(),
  };
} else {
  try {
    // cast to unknown first because expo-sqlite definitions might be slightly more complex
    db = SQLite.openDatabaseSync('instocker.db') as unknown as LocalDB;
  } catch (e) {
    console.error("Failed to open database:", e);
    // Fallback to avoid crash if native DB fails
    db = {} as LocalDB;
  }
}

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
