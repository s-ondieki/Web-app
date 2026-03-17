const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ggta.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database at:', dbPath);
});

db.serialize(() => {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table initialized');
        }
    });

    // Create travel_plans table
    db.run(`
        CREATE TABLE IF NOT EXISTS travel_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            id_passport TEXT,
            phone TEXT,
            email TEXT,
            destination TEXT NOT NULL,
            travel_date DATE,
            return_date DATE,
            transport_cost REAL DEFAULT 0,
            accommodation_cost REAL DEFAULT 0,
            food_cost REAL DEFAULT 0,
            activities_cost REAL DEFAULT 0,
            emergency_money REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating travel_plans table:', err.message);
        } else {
            console.log('Travel plans table initialized');
        }
    });
});

module.exports = db;
