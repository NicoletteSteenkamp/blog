import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

// ✅ FIXED CORS (REQUIRED for production)
app.use(cors({
    origin: process.env.CLIENT_URL, // <-- set this in Render
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());

// DB CONNECTION
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 26528,
    ssl: {
        rejectUnauthorized: false
    }
});

// DB CONNECT
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// JWT middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        req.user = decoded;
        next();
    });
};

// TOKEN GENERATOR
const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    // ✅ FIXED COOKIE SETTINGS FOR CROSS-ORIGIN
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });
};

// REGISTER
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = { name, email, password: hashedPassword };

        db.query('INSERT INTO users SET ?', user, (err, result) => {
            if (err) return res.status(500).json({ message: 'Insert error' });

            generateToken(result.insertId, res);

            res.status(201).json({ message: 'User registered' });
        });
    });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateToken(user.id, res);

        res.json({ message: 'Login successful' });
    });
});

// PROTECTED ROUTE
const verifyToken = (req, res, next) => {
    console.log("COOKIES:", req.cookies);

    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.log("NO TOKEN FOUND");
        return res.status(403).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("TOKEN INVALID", err);
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};
//Posts
app.post('/api/posts', verifyToken, (req, res) => {
    const { title, desc, img, cat } = req.body;

    const q = `
        INSERT INTO posts(title, \`desc\`, img, cat, date, uid)
        VALUES (?, ?, ?, ?, NOW(), ?)
    `;

    db.query(
        q,
        [title, desc, img, cat, req.user.id],
        (err, data) => {
            if (err) return res.status(500).json(err);
            return res.json({ message: "Post created" });
        }
    );
});

app.get('/api/posts', (req, res) => {
    const q = req.query.cat
        ? "SELECT * FROM posts WHERE cat = ?"
        : "SELECT * FROM posts";

    db.query(q, [req.query.cat], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});
// START SERVER
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});