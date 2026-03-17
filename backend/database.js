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
    }
};

