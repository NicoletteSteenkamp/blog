import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = (req, res) => {
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertQ =
      "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";

    const values = [req.body.username, req.body.email, hash];

    db.query(insertQ, [values], (err) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

// LOGIN (EMAIL BASED — FIXED)
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong email or password!");

    const token = jwt.sign(
      { id: data[0].id },
      process.env.JWT_SECRET
    );

    const { password, ...user } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json(user);
  });
};

// LOGOUT
export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out.");
};