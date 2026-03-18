const express = require('express');
const path = require('path');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const app = express();
const db = require('./database');

// Initialize database
require('./initDb');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-in-production', // Change this in production!
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(express.static(path.join(__dirname, '../frontend')));

// ===== MODERN API ENDPOINTS (JSON-based) =====

// API: Register
app.post('/api/auth/register', 
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { name, email, password } = req.body;

        db.registerUser(name, email, password, (err, user) => {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email already registered' });
                }
                console.error('Registration error:', err);
                return res.status(500).json({ error: 'Registration failed' });
            }
            
            // Auto-login after registration
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.userName = user.name;
            
            res.json({ success: true, message: 'Registration successful', user: { id: user.id, name: user.name, email: user.email } });
        });
    }
);

// API: Login
app.post('/api/auth/login', 
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').trim().notEmpty().withMessage('Password is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { email, password } = req.body;

        db.verifyUser(email, password, (err, user) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ error: 'Login failed' });
            } else if (user) {
                // Store user in session
                req.session.userId = user.id;
                req.session.userEmail = user.email;
                req.session.userName = user.name;
                res.json({ success: true, message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        });
    }
);

// API: Save Travel Plan
app.post('/api/plan',
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('travel_date').notEmpty().withMessage('Travel date is required'),
    body('return_date').notEmpty().withMessage('Return date is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const data = {
            user_id: req.session.userId,
            full_name: req.body.full_name,
            id_passport: req.body.id_passport || '',
            phone: req.body.phone || '',
            email: req.body.email,
            destination: req.body.destination,
            travel_date: req.body.travel_date,
            return_date: req.body.return_date,
            transport_cost: 0,
            accommodation_cost: 0,
            food_cost: 0,
            activities_cost: 0,
            emergency_money: 0
        };

        db.saveTravelPlan(data, (err, result) => {
            if (err) {
                console.error('Error saving travel plan:', err);
                return res.status(500).json({ error: 'Failed to save travel plan' });
            }
            res.json({ success: true, message: 'Travel plan saved successfully', data: result });
        });
    }
);

// API: Save Budget
app.post('/api/budget',
    body('transport_cost').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Transport cost must be a positive number'),
    body('accommodation_cost').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Accommodation cost must be a positive number'),
    body('food_cost').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Food cost must be a positive number'),
    body('activities_cost').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Activities cost must be a positive number'),
    body('emergency_money').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Emergency money must be a positive number'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const budgetData = {
            user_id: req.session.userId,
            transport_cost: parseFloat(req.body.transport_cost) || 0,
            accommodation_cost: parseFloat(req.body.accommodation_cost) || 0,
            food_cost: parseFloat(req.body.food_cost) || 0,
            activities_cost: parseFloat(req.body.activities_cost) || 0,
            emergency_money: parseFloat(req.body.emergency_money) || 0
        };

        const total = Object.values(budgetData).slice(1).reduce((a, b) => a + b, 0);

        db.saveBudget(budgetData, (err, result) => {
            if (err) {
                console.error('Error saving budget:', err);
                return res.status(500).json({ error: 'Failed to save budget' });
            }
            res.json({ 
                success: true, 
                message: 'Budget saved successfully',
                data: result,
                total: total
            });
        });
    }
);

// API: Contact Form
app.post('/api/contact', 
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const contactData = {
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message || ''
        };

        // Save contact message (assuming you have a method in db.js)
        db.saveContact(contactData, (err, result) => {
            if (err) {
                console.error('Error saving contact:', err);
                return res.status(500).json({ error: 'Failed to save message' });
            }
            res.json({ success: true, message: 'Thank you for contacting us. We will get back to you soon.' });
        });
    }
);

// ===== ADDITIONAL API ENDPOINTS =====

// API: Get current user info
app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    db.getUserById(req.session.userId, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            }
        });
    });
});

// API: Get all travel plans for current user
app.get('/api/plans', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    db.getUserTravelPlans(req.session.userId, (err, plans) => {
        if (err) {
            console.error('Error fetching travel plans:', err);
            return res.status(500).json({ error: 'Failed to fetch travel plans' });
        }
        res.json({
            success: true,
            plans: plans || [],
            count: (plans || []).length
        });
    });
});

// API: Get budget for current user
app.get('/api/budget', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const query = 'SELECT * FROM budgets WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1';
    const db_instance = require('./initDb');
    db_instance.get(query, [req.session.userId], (err, budget) => {
        if (err) {
            console.error('Error fetching budget:', err);
            return res.status(500).json({ error: 'Failed to fetch budget' });
        }
        if (!budget) {
            return res.json({
                success: true,
                budget: {
                    transport_cost: 0,
                    accommodation_cost: 0,
                    food_cost: 0,
                    activities_cost: 0,
                    emergency_money: 0,
                    total_budget: 0
                }
            });
        }
        res.json({
            success: true,
            budget: budget
        });
    });
});

// API: Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// ===== LEGACY ENDPOINTS (for backward compatibility) =====

app.post('/login', 
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().trim(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>Validation Error</h2>
                        <p>Please provide valid email and password.</p>
                        <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                    </body>
                </html>
            `);
        }

        const { email, password } = req.body;

        db.verifyUser(email, password, (err, user) => {
            if (err) {
                console.error('Login error:', err);
                return res.send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2>Login Error</h2>
                            <p>An error occurred. Please try again.</p>
                            <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                        </body>
                    </html>
                `);
            } else if (user) {
                // Store user in session
                req.session.userId = user.id;
                req.session.userEmail = user.email;
                req.session.userName = user.name;
                res.redirect('/home.html');
            } else {
                res.send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2>Login Failed</h2>
                            <p>Invalid email or password.</p>
                            <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                        </body>
                    </html>
                `);
            }
        });
    }
);


app.post('/register',
    body('name').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').notEmpty(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>Validation Error</h2>
                        <p>Please ensure all fields are valid (password must be at least 6 characters).</p>
                        <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                    </body>
                </html>
            `);
        }

        const { name, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>Registration Failed</h2>
                        <p>Passwords do not match.</p>
                        <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                    </body>
                </html>
            `);
        }

        db.registerUser(name, email, password, (err, user) => {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.send(`
                        <html>
                            <body style="font-family: Arial; text-align: center; padding: 50px;">
                                <h2>Registration Failed</h2>
                                <p>Email already registered.</p>
                                <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                            </body>
                        </html>
                    `);
                }
                console.error('Registration error:', err);
                return res.send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2>Registration Error</h2>
                            <p>An error occurred. Please try again.</p>
                            <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                        </body>
                    </html>
                `);
            }
            
            res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>Registration Successful!</h2>
                        <p>Your account has been created. You can now log in.</p>
                        <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Go to Login</button></a>
                    </body>
                </html>
            `);
        });
    }
);

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>Access Denied</h2>
                    <p>Please log in first.</p>
                    <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Go to Login</button></a>
                </body>
            </html>
        `);
    }
    next();
};

app.post('/save-plan', requireLogin, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>Validation Error</h2>
                    <p>Please fill in all required fields correctly.</p>
                    <a href="plan.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Go Back</button></a>
                </body>
            </html>
        `);
    }

    const data = {
        user_id:              req.session.userId,
        full_name:            req.body.full_name,
        id_passport:          req.body.id_passport,
        phone:                req.body.phone,
        email:                req.body.email,
        destination:          req.body.destination,
        travel_date:          req.body.travel_date,
        return_date:          req.body.return_date,
        transport_cost:       parseFloat(req.body.transport_cost) || 0,
        accommodation_cost:   parseFloat(req.body.accommodation_cost) || 0,
        food_cost:            parseFloat(req.body.food_cost) || 0,
        activities_cost:      parseFloat(req.body.activities_cost) || 0,
        emergency_money:      parseFloat(req.body.emergency_money) || 0
    };

    if (!data.full_name) {
        return res.send(`
            <html><body style="font-family:Arial;text-align:center;padding:50px;">
                <h2>Submission Failed</h2>
                <p>Full Name is required.</p>
                <a href="plan.html"><button style="padding:10px 20px;font-size:16px;cursor:pointer;">Go Back</button></a>
            </body></html>
        `);
    }

    db.saveTravelPlan(data, (err, result) => {
        if (err) {
            console.error('Error saving travel plan:', err);
            return res.send(`
                <html><body style="font-family:Arial;text-align:center;padding:50px;">
                    <h2>Submission Error</h2>
                    <p>An error occurred. Please try again.</p>
                    <a href="plan.html"><button style="padding:10px 20px;font-size:16px;cursor:pointer;">Go Back</button></a>
                </body></html>
            `);
        }
        
        res.send(`
            <html><body style="font-family:Arial;text-align:center;padding:50px;">
                <h2>Travel Plan Saved!</h2>
                <p>Your plan has been submitted successfully.</p>
                <a href="home.html"><button style="padding:10px 20px;font-size:16px;cursor:pointer;">Back to Home</button></a>
            </body></html>
        `);
    });
});

// Logout route (legacy - for HTML form-based logout)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/login.html');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
