const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('./data/ireporter.db');

// Check if admin user already exists
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('Mollyireporter@gmail.com');
if (existingAdmin) {
  console.log('Admin user already exists with email: Mollyireporter@gmail.com');
  db.close();
  process.exit(0);
}

// Hash the password
const hashedPassword = bcrypt.hashSync('password', 10);

// Insert admin user
const result = db.prepare('INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)').run('Mugisha', 'Joshua', 'Mollyireporter@gmail.com', hashedPassword, 1);

console.log('Admin user created successfully!');
console.log('ID:', result.lastInsertRowid);
console.log('Name: Mugisha Joshua');
console.log('Email: Mollyireporter@gmail.com');
console.log('Password: password');
console.log('Is Admin: true');

db.close();
