const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

function addTestUsers() {
  try {
    console.log('👤 Adding test users to SQLite database...');

    // Ensure database directory exists
    const dbDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'ireporter.db');
    const db = new Database(dbPath);

    // Add some test users
    const testUsers = [
      { first_name: 'John', last_name: 'Doe', email: 'john@example.com', password: 'password123' },
      { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', password: 'password123' },
      { first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', password: 'password123' },
      { first_name: 'Alice', last_name: 'Brown', email: 'alice@example.com', password: 'password123' },
      { first_name: 'Mike', last_name: 'Wilson', email: 'mike@example.com', password: 'password123' },
      { first_name: 'Damulira', last_name: 'Hakim', email: 'damulira.hakim@example.com', password: 'password123' }
    ];

    const insertUser = db.prepare('INSERT OR IGNORE INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)');

    for (const user of testUsers) {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      insertUser.run(user.first_name, user.last_name, user.email, hashedPassword);
      console.log('✅ Added user:', user.first_name, user.last_name, '-', user.email);
    }

    console.log('🎉 Test users added successfully!');

    // Show all users
    console.log('\n📊 All users in database:');
    const users = db.prepare('SELECT id, first_name, last_name, email, is_admin, created_at FROM users ORDER BY created_at DESC').all();

    users.forEach((user, index) => {
      const adminBadge = user.is_admin ? '[ADMIN]' : '';
      console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) ${adminBadge}`);
    });

    db.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addTestUsers();
