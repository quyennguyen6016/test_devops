require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                product_name VARCHAR(150) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                total_price DECIMAL(10,2) NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized (PostgreSQL)');
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
})();

module.exports = pool;