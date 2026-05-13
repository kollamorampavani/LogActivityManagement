require('dotenv').config({path: '../.env'});
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.query("ALTER TABLE logs ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';")
    .then(() => { console.log("Added category column"); process.exit(0); })
    .catch(e => { console.error(e); process.exit(1); });
