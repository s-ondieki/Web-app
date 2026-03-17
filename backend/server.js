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


app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

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

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/login.html');
    });
});

// Get current user info (API endpoint)
app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    res.json({
        userId: req.session.userId,
        email: req.session.userEmail,
        name: req.session.userName
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
