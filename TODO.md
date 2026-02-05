# TODO: Convert All Database Code to PostgreSQL

## Tasks
- [x] Update backend/middleware/auth.ts: Replace pool.execute with pool.query, change ? to $1, adjust result handling
- [x] Update backend/Controllers/commentsController.ts: Replace pool.execute with pool.query, change ? to $1, adjust result handling
- [x] Update backend/test-passwords.js: Replace pool.execute with pool.query, change ? to $1, adjust result handling
- [x] Run TypeScript compilation to verify errors are resolved
- [x] Convert backend/setupTables.js from MySQL to PostgreSQL
- [x] Convert backend/run_audio_migration.js from MySQL to PostgreSQL
