import express from "express";
import client from "../db/client.js";
import { requireAuth } from "./users.js";
import { v4 as uuidv4 } from "uuid";

const favoritesRouter = express.Router();

async function resolveBusinessDatabaseId(identifier) {
  const result = await client.query(
    `
      SELECT id
      FROM businesses
      WHERE business_id = $1
         OR id::text = $1
      LIMIT 1
    `,
    [identifier],
  );

  return result.rows[0]?.id ?? null;
}

async function resolveEventId(identifier) {
  const result = await client.query(
    `
      SELECT id
      FROM events
      WHERE id::text = $1
      LIMIT 1
    `,
    [identifier],
  );

  return result.rows[0]?.id ?? null;
}

/*
  GET /api/favorites

  Returns all favorites belonging to the logged-in user.
*/
favoritesRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const [businesses, events] = await Promise.all([
      client.query(
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
          FROM favorite_businesses f
          JOIN businesses b
            ON b.id = f.business_id
          WHERE f.user_id = $1
          ORDER BY b.business_name
        `,
        [req.user.id],
      ),

      client.query(
        `
          SELECT
            e.id,
            e.kind,
            e.title,
            e.description,
            e.venue,
            e.location,
            e.city,
            e.region,
            e.country,
            e.time_zone,
            TO_CHAR(e.event_date, 'YYYY-MM-DD') AS event_date,
            TO_CHAR(e.start_time, 'HH24:MI') AS start_time,
            TO_CHAR(e.end_time, 'HH24:MI') AS end_time
          FROM favorite_events f
          JOIN events e
            ON e.id = f.event_id
          WHERE f.user_id = $1
          ORDER BY e.event_date, e.start_time
        `,
        [req.user.id],
      ),
    ]);

    res.json({
      businesses: businesses.rows,
      events: events.rows,
    });
  } catch (error) {
    next(error);
  }
});

/*
  POST /api/favorites/business/:businessId

  Accepts either the Google Place business ID or the internal database UUID.
*/
favoritesRouter.post(
  "/business/:businessId",
  requireAuth,
  async (req, res, next) => {
    try {
      const businessId = await resolveBusinessDatabaseId(
        req.params.businessId,
      );

      if (!businessId) {
        return res.status(404).json({
          error: "Business not found.",
        });
      }

      const result = await client.query(
        `
          INSERT INTO favorite_businesses (
            id,
            user_id,
            business_id
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, business_id) DO NOTHING
          RETURNING id
        `,
        [uuidv4(), req.user.id, businessId],
      );

      const alreadyFavorite = result.rows.length === 0;

      return res.status(alreadyFavorite ? 200 : 201).json({
        message: alreadyFavorite
          ? "Business is already in your favorites."
          : "Business added to your favorites.",
        businessId: req.params.businessId,
        added: true,
        alreadyFavorite,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
  POST /api/favorites/event/:eventId
*/
favoritesRouter.post(
  "/event/:eventId",
  requireAuth,
  async (req, res, next) => {
    try {
      const eventId = await resolveEventId(req.params.eventId);

      if (!eventId) {
        return res.status(404).json({
          error: "Event not found.",
        });
      }

      const result = await client.query(
        `
          INSERT INTO favorite_events (
            id,
            user_id,
            event_id
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, event_id) DO NOTHING
          RETURNING id
        `,
        [uuidv4(), req.user.id, eventId],
      );

      const alreadyFavorite = result.rows.length === 0;

      return res.status(alreadyFavorite ? 200 : 201).json({
        message: alreadyFavorite
          ? "Event is already in your favorites."
          : "Event added to your favorites.",
        eventId,
        added: true,
        alreadyFavorite,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
  DELETE /api/favorites/business/:businessId
*/
favoritesRouter.delete(
  "/business/:businessId",
  requireAuth,
  async (req, res, next) => {
    try {
      const businessId = await resolveBusinessDatabaseId(
        req.params.businessId,
      );

      if (!businessId) {
        return res.status(404).json({
          error: "Business not found.",
        });
      }

      const result = await client.query(
        `
          DELETE FROM favorite_businesses
          WHERE user_id = $1
            AND business_id = $2
          RETURNING id
        `,
        [req.user.id, businessId],
      );

      const removed = result.rows.length > 0;

      return res.json({
        message: removed
          ? "Business removed from favorites."
          : "Business was not in your favorites.",
        businessId: req.params.businessId,
        removed,
      });
    } catch (error) {
      next(error);
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
      const eventId = await resolveEventId(req.params.eventId);

      if (!eventId) {
        return res.status(404).json({
          error: "Event not found.",
        });
      }

      const result = await client.query(
        `
          DELETE FROM favorite_events
          WHERE user_id = $1
            AND event_id = $2
          RETURNING id
        `,
        [req.user.id, eventId],
      );

      const removed = result.rows.length > 0;

      return res.json({
        message: removed
          ? "Event removed from favorites."
          : "Event was not in your favorites.",
        eventId,
        removed,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default favoritesRouter;
