import express from "express";
import client from "../db/client.js";
import { requireAuth } from "./users.js";
import { v4 as uuidv4, validate as isUuid } from "uuid";

const eventsRouter = express.Router();

const eventColumns = `
  e.id,
  e.created_by,
  e.business_id,
  e.kind,
  e.title,
  e.description,
  e.venue,
  e.location AS address,
  e.city,
  e.region,
  e.country,
  e.time_zone,
  e.latitude,
  e.longitude,
  TO_CHAR(e.event_date, 'YYYY-MM-DD') AS event_date,
  TO_CHAR(e.start_time, 'HH24:MI') AS start_time,
  TO_CHAR(e.end_time, 'HH24:MI') AS end_time,
  e.image_url,
  e.is_free,
  e.is_demo,
  e.created_at
`;

function formatEvent(event) {
  const hasCoordinates =
    event.latitude != null &&
    event.longitude != null &&
    Number.isFinite(Number(event.latitude)) &&
    Number.isFinite(Number(event.longitude));

  return {
    id: event.id,
    createdBy: event.created_by,
    businessId: event.business_id,
    kind: event.kind,
    title: event.title,
    description: event.description,
    venue: event.venue,
    address: event.address ?? "",
    city: event.city,
    region: event.region,
    country: event.country,
    timeZone: event.time_zone,
    eventDate: event.event_date,
    startTime: event.start_time,
    endTime: event.end_time,
    location: hasCoordinates
      ? {
          lat: Number(event.latitude),
          lng: Number(event.longitude),
        }
      : null,
    imageUrl: event.image_url,
    imageAlt: event.city
      ? `${event.title} in ${event.city}`
      : event.title,
    isFree: event.is_free,
    isDemo: event.is_demo,
    createdAt: event.created_at,
  };
}

function rejectInvalidEventId(req, res) {
  if (isUuid(req.params.id)) {
    return false;
  }

  res.status(400).json({
    error: "Invalid event ID.",
  });

  return true;
}

/*
  GET /api/events

  Gets all events.
*/
eventsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await client.query(
      `
      SELECT
        ${eventColumns}
      FROM events e
      ORDER BY e.event_date ASC, e.start_time ASC
      `,
    );

    res.json({
      events: result.rows.map(formatEvent),
    });
  } catch (err) {
    next(err);
  }
});

/*
  GET /api/events/calendar

  Gets the logged-in user's calendar events.
  This route must appear before GET /api/events/:id.
*/
eventsRouter.get("/calendar", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
      SELECT
        ${eventColumns}
      FROM event_attendance ea
      JOIN events e ON e.id = ea.event_id
      WHERE ea.user_id = $1
      ORDER BY e.event_date ASC, e.start_time ASC
      `,
      [req.user.id],
    );

    res.json({
      events: result.rows.map(formatEvent),
    });
  } catch (err) {
    next(err);
  }
});

/*
  GET /api/events/:id
*/
eventsRouter.get("/:id", async (req, res, next) => {
  if (rejectInvalidEventId(req, res)) {
    return;
  }

  try {
    const result = await client.query(
      `
      SELECT
        ${eventColumns}
      FROM events e
      WHERE e.id = $1
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json({
      event: formatEvent(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
});

/*
  POST /api/events

  Logged-in users can create events.
  Moderation will be added before user events are publicly published.
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

    await client.query(
      `
      INSERT INTO events (
        id,
        created_by,
        title,
        description,
        location,
        event_date,
        start_time,
        end_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

    const result = await client.query(
      `
      SELECT
        ${eventColumns}
      FROM events e
      WHERE e.id = $1
      `,
      [id],
    );

    res.status(201).json({
      event: formatEvent(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
});

/*
  POST /api/events/:id/attendance

  Adds an existing event to the logged-in user's Rooted calendar.
*/
eventsRouter.post("/:id/attendance", requireAuth, async (req, res, next) => {
  if (rejectInvalidEventId(req, res)) {
    return;
  }

  try {
    const eventResult = await client.query(
      `
      SELECT id
      FROM events
      WHERE id = $1
      `,
      [req.params.id],
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    const attendanceResult = await client.query(
      `
      INSERT INTO event_attendance (
        id,
        user_id,
        event_id
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, event_id) DO NOTHING
      RETURNING id
      `,
      [uuidv4(), req.user.id, req.params.id],
    );

    const alreadyAdded = attendanceResult.rows.length === 0;

    res.status(alreadyAdded ? 200 : 201).json({
      message: alreadyAdded
        ? "Event is already on your calendar."
        : "Event added to your calendar.",
      eventId: req.params.id,
      added: true,
      alreadyAdded,
    });
  } catch (err) {
    next(err);
  }
});

/*
  DELETE /api/events/:id/attendance

  Removes an event from the logged-in user's Rooted calendar.
*/
eventsRouter.delete("/:id/attendance", requireAuth, async (req, res, next) => {
  if (rejectInvalidEventId(req, res)) {
    return;
  }

  try {
    const result = await client.query(
      `
      DELETE FROM event_attendance
      WHERE user_id = $1
      AND event_id = $2
      RETURNING id
      `,
      [req.user.id, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event is not on your calendar.",
      });
    }

    res.json({
      message: "Event removed from your calendar.",
      eventId: req.params.id,
      removed: true,
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
  if (rejectInvalidEventId(req, res)) {
    return;
  }

  try {
    const result = await client.query(
      `
      DELETE FROM events
      WHERE id = $1
      AND created_by = $2
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
