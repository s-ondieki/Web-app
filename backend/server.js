const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'change_this_secret_key';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register
app.post('/api/register', (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  db.findUserByEmail(email, async (err, user) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }
    if (user) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      db.createUser({ fullName, email, passwordHash: hash }, (err2, newUser) => {
        if (err2) {
          console.error('DB error:', err2);
          return res.status(500).json({ message: 'Server error.' });
        }
        res.status(201).json({ message: 'Registration successful.', user: newUser });
      });
    } catch (e) {
      console.error('Hash error:', e);
      res.status(500).json({ message: 'Server error.' });
    }
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  db.findUserByEmail(email, async (err, user) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  });
});

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Example protected route
app.get('/api/profile', auth, (req, res) => {
  db.findUserById(req.user.id, (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'User not found.' });
    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        created_at: user.created_at
      }
    });
  });
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  db.saveContact({ name, email, subject, message }, (err, saved) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Failed to save message.' });
    }
    res.status(201).json({ message: 'Message received. We will get back to you soon!', contact: saved });
  });
});

// Save travel plan (protected)
app.post('/api/plan', auth, (req, res) => {
  const { full_name, email, phone, id_passport, destination, travel_date, return_date } = req.body;

  if (!full_name || !email || !destination || !travel_date || !return_date) {
    return res.status(400).json({ message: 'Full name, email, destination, and dates are required.' });
  }

  const planData = {
    user_id: req.user.id,
    full_name,
    id_passport: id_passport || '',
    phone: phone || '',
    email,
    destination,
    travel_date,
    return_date,
    transport_cost: 0,
    accommodation_cost: 0,
    food_cost: 0,
    activities_cost: 0,
    emergency_money: 0
  };

  db.saveTravelPlan(planData, (err, saved) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Failed to save travel plan.' });
    }
    res.status(201).json({ message: 'Travel plan saved successfully!', plan: saved });
  });
});

// Get travel plans for logged-in user (protected)
app.get('/api/plan', auth, (req, res) => {
  db.getTravelPlansByUser(req.user.id, (err, plans) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Failed to fetch plans.' });
    }
    res.json({ plans });
  });
});

// Save / update budget (protected)
app.post('/api/budget', auth, (req, res) => {
  const { transport_cost, accommodation_cost, food_cost, activities_cost, emergency_money } = req.body;

  const budgetData = {
    user_id: req.user.id,
    transport_cost: parseFloat(transport_cost) || 0,
    accommodation_cost: parseFloat(accommodation_cost) || 0,
    food_cost: parseFloat(food_cost) || 0,
    activities_cost: parseFloat(activities_cost) || 0,
    emergency_money: parseFloat(emergency_money) || 0
  };

  db.saveBudget(budgetData, (err, saved) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Failed to save budget.' });
    }
    res.status(201).json({ message: 'Budget saved successfully!', budget: saved });
  });
});

// Get budget for logged-in user (protected)
app.get('/api/budget', auth, (req, res) => {
  db.getBudgetByUser(req.user.id, (err, budget) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Failed to fetch budget.' });
    }
    res.json({ budget: budget || null });
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});