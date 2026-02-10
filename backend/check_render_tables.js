const { Client } = require('pg');

async function checkRenderTables() {
  const databaseUrl = 'postgresql://ireporter_user:oRnHxJE58hx8z2xyZVuxRIILi4HOhN7e@dpg-d606jnffte5s73d97d10-a.oregon-postgres.render.com:5432/ireporter_joshua';

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Render PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Checking for tables...');
    const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tables = result.rows.map(row => row.table_name);

    console.log('Tables found:', tables);

    if (tables.length === 0) {
      console.log('No tables found. Database needs initialization.');
    } else {
      console.log('Tables are present.');
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

checkRenderTables();
