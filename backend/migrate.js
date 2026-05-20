require('dotenv').config();
const pool = require('./config/db');

async function runMigration() {
    try {
        console.log('Running migration...');
        // Add log_date column, use created_at as default for existing rows
        await pool.query('ALTER TABLE logs ADD COLUMN IF NOT EXISTS log_date DATE');
        await pool.query('UPDATE logs SET log_date = created_at::date WHERE log_date IS NULL');
        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
