const db = require('./initDb');
const bcrypt = require('bcryptjs');

module.exports = {
    // User Authentication
    verifyUser: (email, password, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        
        db.get(query, [email], async (err, user) => {
            if (err) {
                return callback(err);
            }
            
            if (!user) {
                return callback(null, null); // User not found
            }
            
            try {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    callback(null, user);
                } else {
                    callback(null, null); // Password doesn't match
                }
            } catch (err) {
                callback(err);
            }
        });
    },

    registerUser: (name, email, password, callback) => {
        // Check if email already exists
        db.get('SELECT email FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return callback(err);
            }

            if (user) {
                const error = new Error('UNIQUE constraint failed: users.email');
                return callback(error);
            }

            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Insert user
                const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
                db.run(query, [name, email, hashedPassword], function(err) {
                    if (err) {
                        return callback(err);
                    }
                    
                    callback(null, {
                        id: this.lastID,
                        name,
                        email,
                        created_at: new Date().toISOString()
                    });
                });
            } catch (err) {
                callback(err);
            }
        });
    },

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

        db.run(query, values, function(err) {
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

    // Get user by ID
    getUserById: (userId, callback) => {
        const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
        db.get(query, [userId], (err, user) => {
            callback(err, user);
        });
    },

    // Get all travel plans for a user
    getUserTravelPlans: (userId, callback) => {
        const query = 'SELECT * FROM travel_plans WHERE user_id = ? ORDER BY created_at DESC';
        db.all(query, [userId], (err, plans) => {
            callback(err, plans);
        });
    },

    // Get a single travel plan by ID
    getTravelPlanById: (planId, userId, callback) => {
        const query = 'SELECT * FROM travel_plans WHERE id = ? AND user_id = ?';
        db.get(query, [planId, userId], (err, plan) => {
            callback(err, plan);
        });
    },

    // Save budget
    saveBudget: (data, callback) => {
        const total = data.transport_cost + data.accommodation_cost + data.food_cost + data.activities_cost + data.emergency_money;
        
        // Check if budget exists for this user
        const checkQuery = 'SELECT id FROM budgets WHERE user_id = ?';
        db.get(checkQuery, [data.user_id], (err, existingBudget) => {
            if (err) {
                return callback(err);
            }

            if (existingBudget) {
                // Update existing budget
                const updateQuery = `
                    UPDATE budgets SET
                    transport_cost = ?,
                    accommodation_cost = ?,
                    food_cost = ?,
                    activities_cost = ?,
                    emergency_money = ?,
                    total_budget = ?,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                `;
                db.run(updateQuery, [
                    data.transport_cost,
                    data.accommodation_cost,
                    data.food_cost,
                    data.activities_cost,
                    data.emergency_money,
                    total,
                    data.user_id
                ], function(err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, {
                        user_id: data.user_id,
                        ...data,
                        total_budget: total,
                        updated_at: new Date().toISOString()
                    });
                });
            } else {
                // Create new budget
                const insertQuery = `
                    INSERT INTO budgets (
                        user_id, transport_cost, accommodation_cost,
                        food_cost, activities_cost, emergency_money, total_budget
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                db.run(insertQuery, [
                    data.user_id,
                    data.transport_cost,
                    data.accommodation_cost,
                    data.food_cost,
                    data.activities_cost,
                    data.emergency_money,
                    total
                ], function(err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, {
                        id: this.lastID,
                        user_id: data.user_id,
                        ...data,
                        total_budget: total,
                        created_at: new Date().toISOString()
                    });
                });
            }
        });
    },

    // Save contact message
    saveContact: (data, callback) => {
        const query = `
            INSERT INTO contacts (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `;

        db.run(query, [data.name, data.email, data.subject, data.message], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, {
                id: this.lastID,
                ...data,
                created_at: new Date().toISOString()
            });
        });
    }
};

