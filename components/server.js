const express = require('express');
const path = require('path');
const app = express();
const db = require('./database');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));


app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.verifyUser(email, password, (err, user) => {
        if (err) {
            res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>Login Error</h2>
                        <p>An error occurred. Please try again.</p>
                        <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                    </body>
                </html>
            `);
        } else if (user) {
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
});


app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>Registration Failed</h2>
                    <p>Passwords do not match.</p>
                    <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                </body>
            </html>
        `);
        return;
    }

    db.registerUser(name, email, password, (err, user) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2>Registration Failed</h2>
                            <p>Email already registered.</p>
                            <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                        </body>
                    </html>
                `);
            } else {
                res.send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2>Registration Error</h2>
                            <p>An error occurred. Please try again.</p>
                            <a href="register.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Try Again</button></a>
                        </body>
                    </html>
                `);
            }
        } else {
            res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>Registration Successful!</h2>
                        <p>Your account has been created. You can now log in.</p>
                        <a href="login.html"><button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Go to Login</button></a>
                    </body>
                </html>
            `);
        }
    });
});

app.post('/save-plan', (req, res) => {
    const data = {
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
            res.send(`
                <html><body style="font-family:Arial;text-align:center;padding:50px;">
                    <h2>Submission Error</h2>
                    <p>An error occurred. Please try again.</p>
                    <a href="plan.html"><button style="padding:10px 20px;font-size:16px;cursor:pointer;">Go Back</button></a>
                </body></html>
            `);
        } else {
            res.send(`
                <html><body style="font-family:Arial;text-align:center;padding:50px;">
                    <h2>Travel Plan Saved!</h2>
                    <p>Your plan has been submitted successfully.</p>
                    <a href="home.html"><button style="padding:10px 20px;font-size:16px;cursor:pointer;">Back to Home</button></a>
                </body></html>
            `);
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
