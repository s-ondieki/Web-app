// Central SQLite database helper for GGT

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ggt.db');
const db = new sqlite3.Database(dbPath);

// --- Initialize tables ---
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Travel plans table
  db.run(`
    CREATE TABLE IF NOT EXISTS travel_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      id_passport TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      destination TEXT NOT NULL,
      travel_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      transport_cost REAL NOT NULL,
      accommodation_cost REAL NOT NULL,
      food_cost REAL NOT NULL,
      activities_cost REAL NOT NULL,
      emergency_money REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      transport_cost REAL NOT NULL,
      accommodation_cost REAL NOT NULL,
      food_cost REAL NOT NULL,
      activities_cost REAL NOT NULL,
      emergency_money REAL NOT NULL,
      total REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Contacts table
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const database = {
  // ---------------- USERS ----------------

  findUserByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], (err, row) => callback(err, row));
  },

  findUserById: (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.get(query, [id], (err, row) => callback(err, row));
  },

  createUser: (data, callback) => {
    const query = `
      INSERT INTO users (full_name, email, password_hash)
      VALUES (?, ?, ?)
    `;
    const fullName = data.full_name || data.fullName; // support both keys
    db.run(
      query,
      [fullName, data.email, data.passwordHash],
      function (err) {
        if (err) return callback(err);
        callback(null, {
          id: this.lastID,
          full_name: fullName,
          email: data.email,
          created_at: new Date().toISOString()
        });
      }
    );
  },

  // ---------------- TRAVEL PLANS ----------------

  saveTravelPlan: (data, callback) => {
    const query = `
      INSERT INTO travel_plans (
        user_id, full_name, id_passport, phone, email, destination,
        travel_date, return_date, transport_cost, accommodation_cost,
        food_cost, activities_cost, emergency_money
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.user_id,
      data.full_name,
      data.id_passport,
      data.phone,
      data.email,
      data.destination,
      data.travel_date,
      data.return_date,
      data.transport_cost,
      data.accommodation_cost,
      data.food_cost,
      data.activities_cost,
      data.emergency_money
    ];

    db.run(query, values, function (err) {
      if (err) return callback(err);
      callback(null, {
        id: this.lastID,
        ...data,
        created_at: new Date().toISOString()
      });
    });
  },

  getTravelPlansByUser: (userId, callback) => {
    const query = 'SELECT * FROM travel_plans WHERE user_id = ? ORDER BY created_at DESC';
    db.all(query, [userId], (err, plans) => {
      callback(err, plans);
    });
  },

  getTravelPlanById: (planId, userId, callback) => {
    const query = 'SELECT * FROM travel_plans WHERE id = ? AND user_id = ?';
    db.get(query, [planId, userId], (err, plan) => {
      callback(err, plan);
    });
  },

  // ---------------- BUDGETS ----------------

  saveBudget: (data, callback) => {
    const total =
      data.transport_cost +
      data.accommodation_cost +
      data.food_cost +
      data.activities_cost +
      data.emergency_money;

    const checkQuery = 'SELECT id FROM budgets WHERE user_id = ?';
    db.get(checkQuery, [data.user_id], (err, existingBudget) => {
      if (err) {
        return callback(err);
      }

      if (existingBudget) {
        // Update existing budget
        const updateQuery = `
          UPDATE budgets
          SET transport_cost = ?,
              accommodation_cost = ?,
              food_cost = ?,
              activities_cost = ?,
              emergency_money = ?,
              total = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `;
        const updateValues = [
          data.transport_cost,
          data.accommodation_cost,
          data.food_cost,
          data.activities_cost,
          data.emergency_money,
          total,
          data.user_id
        ];

        db.run(updateQuery, updateValues, function (updateErr) {
          if (updateErr) return callback(updateErr);
          callback(null, {
            user_id: data.user_id,
            ...data,
            total,
            updated_at: new Date().toISOString()
          });
        });
      } else {
        // Insert new budget
        const insertQuery = `
          INSERT INTO budgets (
            user_id, transport_cost, accommodation_cost, food_cost,
            activities_cost, emergency_money, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [
          data.user_id,
          data.transport_cost,
          data.accommodation_cost,
          data.food_cost,
          data.activities_cost,
          data.emergency_money,
          total
        ];

        db.run(insertQuery, insertValues, function (insertErr) {
          if (insertErr) return callback(insertErr);
          callback(null, {
            id: this.lastID,
            user_id: data.user_id,
            ...data,
            total,
            updated_at: new Date().toISOString()
          });
        });
      }
    });
  },

  getBudgetByUser: (userId, callback) => {
    const query = 'SELECT * FROM budgets WHERE user_id = ?';
    db.get(query, [userId], (err, budget) => {
      callback(err, budget);
    });
  },

  // ---------------- CONTACTS ----------------

  saveContact: (data, callback) => {
    const query = `
      INSERT INTO contacts (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [data.name, data.email, data.subject, data.message], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, {
        id: this.lastID,
        ...data,
        created_at: new Date().toISOString()
      });
    });
  },

  // ---------------- MATCH FINDER ----------------

  /**
   * Find travellers going to the same (or similar) destination.
   * - destination: required keyword, case-insensitive LIKE match
   * - travelDate / returnDate: optional — when provided, only returns plans
   *   whose travel window overlaps with the search window
   * - excludeUserId: the current user — don't show themselves
   */
  findMatches: (destination, travelDate, returnDate, excludeUserId, callback) => {
    let query = `
      SELECT
        tp.id,
        tp.full_name,
        tp.destination,
        tp.travel_date,
        tp.return_date,
        u.id   AS user_id
      FROM travel_plans tp
      JOIN users u ON u.id = tp.user_id
      WHERE tp.destination LIKE ?
        AND tp.user_id != ?
    `;

    const params = ['%' + destination + '%', excludeUserId || 0];

    // Date overlap filter: plans that overlap [travelDate, returnDate]
    // Overlap condition: plan.travel_date <= searchReturnDate
    //                AND plan.return_date >= searchTravelDate
    if (travelDate && returnDate) {
      query += ` AND tp.travel_date <= ? AND tp.return_date >= ?`;
      params.push(returnDate, travelDate);
    } else if (travelDate) {
      // At least travelling on or after search travel date
      query += ` AND tp.return_date >= ?`;
      params.push(travelDate);
    }

    query += ` ORDER BY tp.travel_date ASC LIMIT 50`;

    db.all(query, params, (err, rows) => {
      if (err) return callback(err);
      // Strip any potentially sensitive fields before returning
      const safe = (rows || []).map(r => ({
        id:           r.id,
        full_name:    r.full_name,
        destination:  r.destination,
        travel_date:  r.travel_date,
        return_date:  r.return_date,
      }));
      callback(null, safe);
    });
  }
};

module.exports = database;