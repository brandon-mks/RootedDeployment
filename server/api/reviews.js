import express from "express";
import client from "../db/client.js";
import { requireAuth } from "./users.js";
import { v4 as uuidv4 } from "uuid";

const reviewsRouter = express.Router();

/*
  GET /api/reviews/me

  Get reviews written by the logged-in user.
*/
reviewsRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const businesses = await client.query(
      `
      SELECT
        r.id,
        r.rating,
        r.review_text,
        r.created_at,
        b.id AS business_id,
        b.business_name
      FROM reviews r
      JOIN businesses b
        ON r.business_id = b.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      `,
      [req.user.id],
    );

    const events = await client.query(
      `
      SELECT
        r.id,
        r.rating,
        r.review_text,
        r.created_at,
        e.id AS event_id,
        e.title
      FROM reviews r
      JOIN events e
        ON r.event_id = e.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      `,
      [req.user.id],
    );

    res.json({
      businesses: businesses.rows,
      events: events.rows,
    });
  } catch (err) {
    next(err);
  }
});

/*
  POST /api/reviews/business/:businessId
*/
reviewsRouter.post(
  "/business/:businessId",
  requireAuth,
  async (req, res, next) => {
    const { rating, reviewText } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5.",
      });
    }

    try {
      const result = await client.query(
        `
        INSERT INTO reviews (
          id,
          user_id,
          business_id,
          rating,
          review_text
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          uuidv4(),
          req.user.id,
          req.params.businessId,
          rating,
          reviewText || null,
        ],
      );

      res.status(201).json({
        review: result.rows[0],
      });
    } catch (err) {
      next(err);
    }
  },
);

/*
  POST /api/reviews/event/:eventId
*/
reviewsRouter.post("/event/:eventId", requireAuth, async (req, res, next) => {
  const { rating, reviewText } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: "Rating must be between 1 and 5.",
    });
  }

  try {
    const result = await client.query(
      `
        INSERT INTO reviews (
          id,
          user_id,
          event_id,
          rating,
          review_text
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
      [uuidv4(), req.user.id, req.params.eventId, rating, reviewText || null],
    );

    res.status(201).json({
      review: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

/*
  DELETE /api/reviews/:id
*/
reviewsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
      DELETE FROM reviews
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Review not found.",
      });
    }

    res.json({
      message: "Review deleted.",
    });
  } catch (err) {
    next(err);
  }
});

export default reviewsRouter;
