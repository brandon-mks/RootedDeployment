import express from "express";
import client from "../db/client.js";
import { requireAuth } from "./users.js";

const favoritesRouter = express.Router();

/*
  GET /api/favorites
  Get all favorites belonging to the logged-in user
*/
favoritesRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const businesses = await client.query(
      `
      SELECT
        b.id,
        b.business_id,
        b.business_name,
        b.address,
        b.phone_number,
        b.overview,
        b.link,
        b.email,
        b.rating
      FROM favorites f
      JOIN businesses b
        ON f.business_id = b.id
      WHERE f.user_id = $1
      `,
      [req.user.id],
    );

    const events = await client.query(
      `
      SELECT
        e.id,
        e.title,
        e.description,
        e.location,
        e.event_date,
        e.start_time,
        e.end_time
      FROM favorites f
      JOIN events e
        ON f.event_id = e.id
      WHERE f.user_id = $1
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
  POST /api/favorites/business/:businessId
*/
favoritesRouter.post(
  "/business/:businessId",
  requireAuth,
  async (req, res, next) => {
    try {
      const { businessId } = req.params;

      const result = await client.query(
        `
        INSERT INTO favorites(user_id, business_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, business_id)
        DO NOTHING
        RETURNING *
        `,
        [req.user.id, businessId],
      );

      res.status(201).json({
        favorite: result.rows[0] || null,
      });
    } catch (err) {
      next(err);
    }
  },
);

/*
  POST /api/favorites/event/:eventId
*/
favoritesRouter.post("/event/:eventId", requireAuth, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const result = await client.query(
      `
        INSERT INTO favorites(user_id, event_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, event_id)
        DO NOTHING
        RETURNING *
        `,
      [req.user.id, eventId],
    );

    res.status(201).json({
      favorite: result.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

/*
  DELETE /api/favorites/business/:businessId
*/
favoritesRouter.delete(
  "/business/:businessId",
  requireAuth,
  async (req, res, next) => {
    try {
      await client.query(
        `
        DELETE FROM favorites
        WHERE user_id = $1
        AND business_id = $2
        `,
        [req.user.id, req.params.businessId],
      );

      res.json({
        message: "Business removed from favorites.",
      });
    } catch (err) {
      next(err);
    }
  },
);

/*
  DELETE /api/favorites/event/:eventId
*/
favoritesRouter.delete(
  "/event/:eventId",
  requireAuth,
  async (req, res, next) => {
    try {
      await client.query(
        `
        DELETE FROM favorites
        WHERE user_id = $1
        AND event_id = $2
        `,
        [req.user.id, req.params.eventId],
      );

      res.json({
        message: "Event removed from favorites.",
      });
    } catch (err) {
      next(err);
    }
  },
);

export default favoritesRouter;
