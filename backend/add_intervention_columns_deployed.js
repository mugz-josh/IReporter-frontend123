const { query } = require('./config/database');

async function addInterventionColumns() {
  try {
    console.log('🔧 Adding missing columns to interventions table...');

    // Add images column
    try {
      await query('ALTER TABLE interventions ADD COLUMN IF NOT EXISTS images TEXT');
      console.log('✅ Added images column to interventions');
    } catch (error) {
      console.log('⚠️  Images column might already exist or error:', error.message);
    }

    // Add videos column
    try {
      await query('ALTER TABLE interventions ADD COLUMN IF NOT EXISTS videos TEXT');
      console.log('✅ Added videos column to interventions');
    } catch (error) {
      console.log('⚠️  Videos column might already exist or error:', error.message);
    }

    console.log('🎉 Migration completed successfully for interventions');
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

addInterventionColumns();
