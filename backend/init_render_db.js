const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initRenderDatabase() {
  const databaseUrl = 'postgresql://ireporter_user:oRnHxJE58hx8z2xyZVuxRIILi4HOhN7e@dpg-d606jnffte5s73d97d10-a.oregon-postgres.render.com:5432/ireporter_joshua';

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Render PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.join(__dirname, 'config', 'init-postgres.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing SQL initialization...');

    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]?.trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        await client.query(statement);
      }
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

initRenderDatabase();
