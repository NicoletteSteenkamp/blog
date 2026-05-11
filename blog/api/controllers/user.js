import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER USER
export const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json("Missing fields");
  }

  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [email, username], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length) {
      return res.status(409).json("User already exists");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const insertQuery =
      "INSERT INTO users (`username`, `email`, `password`) VALUES (?)";

    const values = [username, email, hash];

    db.query(insertQuery, [values], (err, result) => {
      if (err) return res.status(500).json(err);

      return res.status(201).json("User registered successfully");
    });
  });
};

// LOGIN USER
export const login = (req, res) => {
  const { email, password } = req.body;

  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length === 0) {
      return res.status(404).json("User not found");
    }

    const user = data[0];

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json("Wrong email or password");
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...other } = user;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json(other);
  });
};

// LOGOUT USER
export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User logged out");
};