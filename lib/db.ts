import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Default categories to seed
const DEFAULT_CATEGORIES = [
  'Room and Utility',
  'Daily Expense',
  'Borrow Others',
  'Food & Drinks',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Other'
];

// Initialize database tables
export async function initializeDatabase() {
  const pool = getPool();

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS income (
      id VARCHAR(255) PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(255) PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      category VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id VARCHAR(255) PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables initialized successfully');

  // Seed default categories if none exist
  const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
  const categoryCount = parseInt(categoriesResult.rows[0].count);

  if (categoryCount === 0) {
    console.log('Seeding default categories...');
    for (const category of DEFAULT_CATEGORIES) {
      const id = 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      await pool.query(
        'INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [id, category]
      );
      console.log(`  Added category: ${category}`);
    }
    console.log('Default categories seeded successfully');
  } else {
    console.log(`Skipping category seeding: ${categoryCount} categories already exist`);
  }
}
