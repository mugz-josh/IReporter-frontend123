import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Always use PostgreSQL
console.log('🌐 Using PostgreSQL');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('⚠️  WARNING: DATABASE_URL environment variable is not set!');
  console.warn('❌ The application will not be able to connect to the database.');
  console.warn('📝 Please set DATABASE_URL in your environment variables with format:');
  console.warn('   postgresql://username:password@host:port/database');
}

console.log('🔗 Database URL configured:', databaseUrl ? 'Yes (hidden for security)' : 'No - MISSING!');

const pool = new Pool({
  connectionString: databaseUrl || 'postgresql://username:password@localhost:5432/ireporter',
  ssl: databaseUrl && databaseUrl.includes('render.com') ? {
    rejectUnauthorized: false, // Enable SSL for Render Postgres
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Initialize database tables
const initializeTables = async () => {
  try {
    console.log('🔧 Initializing PostgreSQL tables...');

    // Try multiple possible paths for the SQL file (development vs production)
    let sqlPath = path.join(__dirname, 'init-postgres.sql');

    // In production (Render), the file might be in the source directory
    if (!fs.existsSync(sqlPath)) {
      sqlPath = path.join(__dirname, '..', '..', 'backend', 'config', 'init-postgres.sql');
    }

    // If still not found, try relative to the project root
    if (!fs.existsSync(sqlPath)) {
      sqlPath = path.join(process.cwd(), 'backend', 'config', 'init-postgres.sql');
    }

    console.log('📂 SQL file path:', sqlPath);

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found at: ${sqlPath}`);
      throw new Error(`SQL initialization file not found at ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 SQL content length:', sqlContent.length);

    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    console.log('📋 Number of SQL statements:', statements.length);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]?.trim();
      if (statement) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}`);
        try {
          await pool.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (stmtError: any) {
          // Don't treat table already exists as an error
          if (stmtError.code === '42P07' || stmtError.message?.includes('already exists')) {
            console.log(`ℹ️  Table already exists (statement ${i + 1}), skipping...`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, stmtError.message || stmtError);
          }
        }
      }
    }

    console.log('✅ PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL tables:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database via connection pool");
    client.release();

    // Initialize tables after successful connection
    await initializeTables();
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err);
  }
};

// Test database connection on startup
testConnection();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = async (sql: string, params: any[] = []) => {
  const result = await pool.query(sql, params);
  return result;
};

export default pool;
