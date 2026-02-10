const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function runSQLiteMigration() {
  try {
    // Connect to the database
    const dbPath = path.join(__dirname, 'data', 'ireporter.db');
    const db = new Database(dbPath);

    console.log('Running SQLite migration...');

    // Read and execute the migration SQL
    const sql = fs.readFileSync(path.join(__dirname, 'migrate_sqlite.sql'), 'utf8');

    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    // Execute each statement
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log('Executing:', trimmedStatement.substring(0, 50) + '...');
        db.exec(trimmedStatement);
      }
    }

    console.log('Migration completed successfully');

    // Close the database
    db.close();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

runSQLiteMigration();
