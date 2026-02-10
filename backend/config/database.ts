import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Always use PostgreSQL
console.log('🌐 Using PostgreSQL');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/ireporter',
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? {
    rejectUnauthorized: false, // Enable SSL for Render Postgres
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database via connection pool");
    client.release();
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err);
  }
};

// Test database connection on startup
testConnection();

export const query = async (sql: string, params: any[] = []) => {
  const result = await pool.query(sql, params);
  return result;
};

export default pool;
