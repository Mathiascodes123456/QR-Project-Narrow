import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../qr_tracking.db');

let db;

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      // Create tables
      createTables()
        .then(() => {
          console.log('Database tables created successfully');
          resolve();
        })
        .catch(reject);
    });
  });
}

async function createTables() {
  const run = promisify(db.run.bind(db));
  
  try {
    // Create scans table
    await run(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vcard_id TEXT NOT NULL,
        scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        country TEXT,
        city TEXT,
        latitude REAL,
        longitude REAL,
        referer TEXT,
        device_type TEXT,
        action TEXT DEFAULT 'scan'
      )
    `);
    
    // Create vcards table
    await run(`
      CREATE TABLE IF NOT EXISTS vcards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT,
        title TEXT,
        email TEXT,
        phone TEXT,
        website TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await run(`CREATE INDEX IF NOT EXISTS idx_scans_vcard_id ON scans(vcard_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_scans_scan_time ON scans(scan_time)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_scans_device_type ON scans(device_type)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_vcards_created_at ON vcards(created_at)`);
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    // Create database connection synchronously
    console.log('Creating database connection...');
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('Connected to SQLite database');
      
      // Create tables immediately after connection
      createTables().catch(error => {
        console.error('Error creating tables:', error);
      });
    });
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    const close = promisify(db.close.bind(db));
    await close();
    console.log('Database connection closed');
  }
}
