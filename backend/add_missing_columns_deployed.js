const { query } = require('./config/database');

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to red_flags table...');

    // Add images column
    try {
      await query('ALTER TABLE red_flags ADD COLUMN IF NOT EXISTS images TEXT');
      console.log('✅ Added images column');
    } catch (error) {
      console.log('⚠️  Images column might already exist or error:', error.message);
    }

    // Add videos column
    try {
      await query('ALTER TABLE red_flags ADD COLUMN IF NOT EXISTS videos TEXT');
      console.log('✅ Added videos column');
    } catch (error) {
      console.log('⚠️  Videos column might already exist or error:', error.message);
    }

    // Add audio column
    try {
      await query('ALTER TABLE red_flags ADD COLUMN IF NOT EXISTS audio TEXT');
      console.log('✅ Added audio column');
    } catch (error) {
      console.log('⚠️  Audio column might already exist or error:', error.message);
    }

    console.log('🎉 Migration completed successfully');
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

addMissingColumns();
