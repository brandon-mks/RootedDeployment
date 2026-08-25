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
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Middleware: attaches req.user if a valid cookie is present.
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      error: "Not authenticated.",
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired session.",
    });
  }
};

/*
 * Middleware: confirms that the authenticated user currently has
 * the admin role in the database.
 *
 * Routes using this middleware must place requireAuth before requireAdmin.
 * The database remains the source of truth instead of trusting a role
 * supplied by the client or stored in an older session token.
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({
      error: "Not authenticated.",
    });
  }

  try {
    const result = await client.query(
      `
        SELECT role
        FROM users
        WHERE id = $1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "User not found.",
      });
    }

    if (result.rows[0].role !== "admin") {
      return res.status(403).json({
        error: "Administrator access is required.",
      });
    }

    req.user = {
      ...req.user,
      role: result.rows[0].role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// --- routes ---

// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, email, password, avatar_url = null } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "username, email, and password are all required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters.",
    });
  }

  try {
    const existing = await client.query(
      `
        SELECT id
        FROM users
        WHERE username = $1
           OR email = $2
      `,
      [username, email],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Username or email already in use.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    /*
     * The role is deliberately omitted from the request and INSERT.
     * PostgreSQL assigns every newly registered user the member role.
     */
    const result = await client.query(
      `
        INSERT INTO users (
          id,
          username,
          email,
          password_hash,
          avatar_url
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          username,
          email,
          avatar_url,
          role
      `,
      [id, username, email, passwordHash, avatar_url],
    );

    const user = result.rows[0];
    const token = createToken(user);

    setAuthCookie(res, token);

    res.status(201).json({
      user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "username and password are required.",
    });
  }

  try {
    const result = await client.query(
      `
        SELECT
          id,
          username,
          email,
          password_hash,
          avatar_url,
          role
        FROM users
        WHERE username = $1
      `,
      [username],
    );

    const user = result.rows[0];

    // Use the same error whether the username or password is incorrect.
    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const token = createToken(user);

    setAuthCookie(res, token);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/logout
usersRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({
    message: "Logged out.",
  });
});

// GET /api/users/me
usersRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
        SELECT
          id,
          username,
          email,
          avatar_url,
          role
        FROM users
        WHERE id = $1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/me
usersRouter.patch("/me", requireAuth, async (req, res, next) => {
  const { username, email, avatar_url } = req.body;

  if (
    username === undefined &&
    email === undefined &&
    avatar_url === undefined
  ) {
    return res.status(400).json({
      error: "Nothing to update.",
    });
  }

  try {
    if (username || email) {
      const conflict = await client.query(
        `
          SELECT id
          FROM users
          WHERE (username = $1 OR email = $2)
            AND id != $3
        `,
        [username || null, email || null, req.user.id],
      );

      if (conflict.rows.length > 0) {
        return res.status(409).json({
          error: "Username or email already in use.",
        });
      }
    }

    /*
     * Profile updates intentionally cannot modify the user's role.
     */
    const result = await client.query(
      `
        UPDATE users
        SET
          username = COALESCE($1, username),
          email = COALESCE($2, email),
          avatar_url = COALESCE($3, avatar_url)
        WHERE id = $4
        RETURNING
          id,
          username,
          email,
          avatar_url,
          role
      `,
      [username || null, email || null, avatar_url ?? null, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
