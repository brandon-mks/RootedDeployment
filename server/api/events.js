import express from "express";
import client from "../db/client.js";
import { requireAuth } from "./users.js";
import { v4 as uuidv4 } from "uuid";

const eventsRouter = express.Router();

/*
  GET /api/events

  Gets all events.
*/
eventsRouter.get("/", async (req, res, next) => {
  try {
    const result = await client.query(
      `
      SELECT
        id,
        user_id,
        title,
        description,
        location,
        event_date,
        start_time,
        end_time,
        created_at
      FROM events
      ORDER BY event_date ASC, start_time ASC
      `,
    );

    res.json({
      events: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

/*
  GET /api/events/:id
*/
eventsRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await client.query(
      `
      SELECT
        id,
        user_id,
        title,
        description,
        location,
        event_date,
        start_time,
        end_time,
        created_at
      FROM events
      WHERE id = $1
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json({
      event: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

/*
  POST /api/events

  Logged-in users can create events.
*/
eventsRouter.post("/", requireAuth, async (req, res, next) => {
  const { title, description, location, eventDate, startTime, endTime } =
    req.body;

  if (!title || !location || !eventDate) {
    return res.status(400).json({
      error: "Title, location, and event date are required.",
    });
  }

  try {
    const id = uuidv4();

    const result = await client.query(
      `
      INSERT INTO events (
        id,
        user_id,
        title,
        description,
        location,
        event_date,
        start_time,
        end_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        id,
        req.user.id,
        title,
        description || null,
        location,
        eventDate,
        startTime || null,
        endTime || null,
      ],
    );

    res.status(201).json({
      event: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

/*
  DELETE /api/events/:id

  Only the person who created the event can delete it.
*/
eventsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
      DELETE FROM events
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found or you do not have permission.",
      });
    }

    res.json({
      message: "Event deleted.",
    });
  } catch (err) {
    next(err);
  }
});

export default eventsRouter;
