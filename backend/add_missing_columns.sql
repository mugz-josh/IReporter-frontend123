-- Add missing columns to existing tables
ALTER TABLE red_flags ADD COLUMN images TEXT;
ALTER TABLE red_flags ADD COLUMN videos TEXT;
ALTER TABLE red_flags ADD COLUMN audio TEXT;

ALTER TABLE interventions ADD COLUMN images TEXT;
ALTER TABLE interventions ADD COLUMN videos TEXT;
ALTER TABLE interventions ADD COLUMN audio TEXT;

ALTER TABLE notifications ADD COLUMN related_entity_type TEXT;
ALTER TABLE notifications ADD COLUMN related_entity_id INTEGER;
