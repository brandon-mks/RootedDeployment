import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import client from "../db/client.js";

const usersRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "rooted_token";

// --- helpers ---
const createToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "7d",
  });

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Middleware: attaches req.user if a valid cookie is present
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
};

// --- routes ---

// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are all required." });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }

  try {
    const existing = await client.query(
      `SELECT id FROM users WHERE username = $1 OR email = $2`,
      [username, email],
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Username or email already in use." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await client.query(
      `INSERT INTO users(id, username, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email`,
      [id, username, email, password_hash],
    );

    const user = result.rows[0];
    const token = createToken(user);
    setAuthCookie(res, token);

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required." });
  }

  try {
    const result = await client.query(
      `SELECT id, username, email, password_hash FROM users WHERE username = $1`,
      [username],
    );
    const user = result.rows[0];

    // Same generic error whether user doesn't exist or password is wrong
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/logout
usersRouter.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out." });
});

// GET /api/users/me  — returns the current user based on the cookie
usersRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `SELECT id, username, email FROM users WHERE id = $1`,
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default usersRouter;
