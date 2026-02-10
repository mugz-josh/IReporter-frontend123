const Database = require('better-sqlite3');
const path = require('path');

function addMissingColumns() {
  try {
    const dbPath = path.join(__dirname, 'data', 'ireporter.db');
    const db = new Database(dbPath);

    console.log('Adding missing columns to database...');

    // Add columns to red_flags table
    try {
      db.exec('ALTER TABLE red_flags ADD COLUMN images TEXT');
      console.log('Added images column to red_flags');
    } catch (e) {
      console.log('images column already exists in red_flags');
    }

    try {
      db.exec('ALTER TABLE red_flags ADD COLUMN videos TEXT');
      console.log('Added videos column to red_flags');
    } catch (e) {
      console.log('videos column already exists in red_flags');
    }

    try {
      db.exec('ALTER TABLE red_flags ADD COLUMN audio TEXT');
      console.log('Added audio column to red_flags');
    } catch (e) {
      console.log('audio column already exists in red_flags');
    }

    // Add columns to interventions table
    try {
      db.exec('ALTER TABLE interventions ADD COLUMN images TEXT');
      console.log('Added images column to interventions');
    } catch (e) {
      console.log('images column already exists in interventions');
    }

    try {
      db.exec('ALTER TABLE interventions ADD COLUMN videos TEXT');
      console.log('Added videos column to interventions');
    } catch (e) {
      console.log('videos column already exists in interventions');
    }

    try {
      db.exec('ALTER TABLE interventions ADD COLUMN audio TEXT');
      console.log('Added audio column to interventions');
    } catch (e) {
      console.log('audio column already exists in interventions');
    }

    // Add columns to notifications table
    try {
      db.exec('ALTER TABLE notifications ADD COLUMN related_entity_type TEXT');
      console.log('Added related_entity_type column to notifications');
    } catch (e) {
      console.log('related_entity_type column already exists in notifications');
    }

    try {
      db.exec('ALTER TABLE notifications ADD COLUMN related_entity_id INTEGER');
      console.log('Added related_entity_id column to notifications');
    } catch (e) {
      console.log('related_entity_id column already exists in notifications');
    }

    console.log('Migration completed successfully');

    db.close();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

addMissingColumns();
