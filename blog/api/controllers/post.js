import { db } from "../db.js";
import jwt from "jsonwebtoken";

// -------------------------
// GET ALL POSTS
// -------------------------
export const getPosts = (req, res) => {
  const cat = req.query.cat;

  const q = cat
    ? "SELECT * FROM posts WHERE cat = ?"
    : "SELECT * FROM posts";

  const params = cat ? [cat] : [];

  db.query(q, params, (err, data) => {
    if (err) {
      console.error("GET POSTS ERROR:", err);
      return res.status(500).json(err);
    }

    return res.status(200).json(data);
  });
};

// -------------------------
// GET SINGLE POST
// -------------------------
export const getPost = (req, res) => {
  const q = `
    SELECT 
      p.id,
      u.username,
      p.title,
      p.desc,
      p.img,
      u.img AS userImg,
      p.cat,
      p.date
    FROM users u
    JOIN posts p ON u.id = p.uid
    WHERE p.id = ?
  `;

  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.error("GET POST ERROR:", err);
      return res.status(500).json(err);
    }

    return res.status(200).json(data[0]);
  });
};

// -------------------------
// ADD POST
// -------------------------
export const addPost = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json("Not authenticated!");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }

    const q = `
      INSERT INTO posts
      (title, \`desc\`, img, cat, date, uid)
      VALUES (?)
    `;

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      new Date(),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        console.error("ADD POST ERROR:", err);
        return res.status(500).json(err);
      }

      return res.status(200).json("Post has been created.");
    });
  });
};

// -------------------------
// DELETE POST
// -------------------------
export const deletePost = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json("Not authenticated!");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }

    const postId = req.params.id;

    const q = "DELETE FROM posts WHERE id = ? AND uid = ?";

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) {
        console.error("DELETE POST ERROR:", err);
        return res.status(500).json(err);
      }

      return res.json("Post has been deleted!");
    });
  });
};

// -------------------------
// UPDATE POST
// -------------------------
export const updatePost = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json("Not authenticated!");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }

    const postId = req.params.id;

    const q = `
      UPDATE posts 
      SET title = ?, desc = ?, img = ?, cat = ?
      WHERE id = ? AND uid = ?
    `;

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
    ];

    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      if (err) {
        console.error("UPDATE POST ERROR:", err);
        return res.status(500).json(err);
      }

      return res.json("Post has been updated.");
    });
  });
};