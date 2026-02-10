-- SQLite migration to add missing columns
-- Check and add columns to red_flags table
PRAGMA foreign_keys = OFF;

-- Add images column to red_flags if it doesn't exist
BEGIN;
CREATE TEMPORARY TABLE red_flags_backup AS SELECT * FROM red_flags;
DROP TABLE red_flags;
CREATE TABLE red_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  images TEXT,
  videos TEXT,
  audio TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
INSERT INTO red_flags (id, user_id, title, description, latitude, longitude, images, videos, audio, status, created_at, updated_at)
SELECT id, user_id, title, description, latitude, longitude, images, videos, NULL, status, created_at, updated_at FROM red_flags_backup;
DROP TABLE red_flags_backup;
COMMIT;

-- Add columns to interventions table if they don't exist
BEGIN;
CREATE TEMPORARY TABLE interventions_backup AS SELECT * FROM interventions;
DROP TABLE interventions;
CREATE TABLE interventions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  images TEXT,
  videos TEXT,
  audio TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
INSERT INTO interventions (id, user_id, title, description, latitude, longitude, images, videos, audio, status, created_at, updated_at)
SELECT id, user_id, title, description, latitude, longitude, images, videos, NULL, status, created_at, updated_at FROM interventions_backup;
DROP TABLE interventions_backup;
COMMIT;

-- Add columns to notifications table if they don't exist
BEGIN;
CREATE TEMPORARY TABLE notifications_backup AS SELECT * FROM notifications;
DROP TABLE notifications;
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT,
  related_entity_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
INSERT INTO notifications (id, user_id, title, message, is_read, related_entity_type, related_entity_id, created_at)
SELECT id, user_id, title, message, is_read, NULL, NULL, created_at FROM notifications_backup;
DROP TABLE notifications_backup;
COMMIT;

PRAGMA foreign_keys = ON;
