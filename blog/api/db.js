import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// -------------------------
// CORS CONFIG
// -------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------
// DB CONNECTION
// -------------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// -------------------------
// TOKEN MIDDLEWARE
// -------------------------
const verifyToken = (req, res, next) => {
  const token =
    req.cookies.access_token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};
// -------------------------
// TOKEN CREATOR
// -------------------------
const generateToken = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};

// -------------------------
// REGISTER
// -------------------------
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [email, username],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const q =
        "INSERT INTO users(username, email, password) VALUES (?, ?, ?)";

      db.query(
        q,
        [username, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json(err);

          generateToken(result.insertId, res);

          res.status(201).json({
            message: "User registered",
          });
        }
      );
    }
  );
});

// -------------------------
// POSTS - GET ALL
// -------------------------
app.get("/api/posts", (req, res) => {
  const q = req.query.cat
    ? "SELECT * FROM posts WHERE cat = ?"
    : "SELECT * FROM posts";

  db.query(q, [req.query.cat], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// -------------------------
// POSTS - GET ONE
// -------------------------
app.get("/api/posts/:id", (req, res) => {
  const q = `
    SELECT p.*, u.name
    FROM posts p
    JOIN users u ON p.uid = u.id
    WHERE p.id = ?
  `;

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data[0]);
  });
});

// -------------------------
// SERVER START
// -------------------------
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});