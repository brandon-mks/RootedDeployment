import express from "express";
import client from "../db/client.js";
import { requireAdmin, requireAuth } from "./users.js";
import { v4 as uuidv4, validate as isUuid } from "uuid";

const eventsRouter = express.Router();

const MODERATION_STATUSES = new Set([
  "pending",
  "approved",
  "rejected",
]);

const REVIEW_DECISIONS = new Set([
  "approved",
  "rejected",
]);

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
  e.moderation_status,
  e.moderation_note,
  e.moderated_by,
  e.moderated_at,
  e.created_at,
  e.updated_at
`;

function formatEvent(event) {
  const hasCoordinates =
    event.latitude != null &&
    event.longitude != null &&
    Number.isFinite(Number(event.latitude)) &&
    Number.isFinite(Number(event.longitude));

  const hasCreator =
    event.creator_username != null ||
    event.creator_email != null;

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
    moderationStatus: event.moderation_status,
    moderationNote: event.moderation_note,
    moderatedBy: event.moderated_by,
    moderatedAt: event.moderated_at,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    creator: hasCreator
      ? {
          username: event.creator_username,
          email: event.creator_email,
        }
      : null,
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

function normalizeRequiredString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTimeString(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validateEventInput(event) {
  if (!event.title || !event.location || !event.eventDate) {
    return "Title, location, and event date are required.";
  }

  if (event.title.length > 150) {
    return "The event title must be 150 characters or fewer.";
  }

  if (event.description && event.description.length > 5000) {
    return "The event description must be 5,000 characters or fewer.";
  }

  if (event.location.length > 500) {
    return "The event location must be 500 characters or fewer.";
  }

  if (!isValidDateString(event.eventDate)) {
    return "Enter a valid event date.";
  }

  if (event.startTime && !isValidTimeString(event.startTime)) {
    return "Enter a valid start time.";
  }

  if (event.endTime && !isValidTimeString(event.endTime)) {
    return "Enter a valid end time.";
  }

  if (event.endTime && !event.startTime) {
    return "A start time is required when an end time is provided.";
  }

  if (
    event.startTime &&
    event.endTime &&
    event.endTime <= event.startTime
  ) {
    return "The event end time must be later than the start time.";
  }

  return null;
}

function createEventInput(body) {
  return {
    title: normalizeRequiredString(body.title),
    description: normalizeOptionalString(body.description),
    location: normalizeRequiredString(body.location),
    eventDate: normalizeRequiredString(body.eventDate),
    startTime: normalizeOptionalString(body.startTime),
    endTime: normalizeOptionalString(body.endTime),
  };
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function mergeEventInput(existingEvent, body) {
  return {
    title: hasOwn(body, "title")
      ? normalizeRequiredString(body.title)
      : existingEvent.title,
    description: hasOwn(body, "description")
      ? normalizeOptionalString(body.description)
      : existingEvent.description,
    location: hasOwn(body, "location")
      ? normalizeRequiredString(body.location)
      : existingEvent.location,
    eventDate: hasOwn(body, "eventDate")
      ? normalizeRequiredString(body.eventDate)
      : existingEvent.event_date,
    startTime: hasOwn(body, "startTime")
      ? normalizeOptionalString(body.startTime)
      : existingEvent.start_time,
    endTime: hasOwn(body, "endTime")
      ? normalizeOptionalString(body.endTime)
      : existingEvent.end_time,
  };
}

/*
  GET /api/events

  Returns approved public events only.
*/
eventsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await client.query(
      `
        SELECT
          ${eventColumns}
        FROM events e
        WHERE e.moderation_status = 'approved'
        ORDER BY e.event_date ASC, e.start_time ASC
      `,
    );

    res.json({
      events: result.rows.map(formatEvent),
    });
  } catch (error) {
    next(error);
  }
});

/*
  GET /api/events/calendar

  Returns approved events on the logged-in user's calendar.
  This route must appear before GET /api/events/:id.
*/
eventsRouter.get("/calendar", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
        SELECT
          ${eventColumns}
        FROM event_attendance ea
        JOIN events e
          ON e.id = ea.event_id
        WHERE ea.user_id = $1
          AND e.moderation_status = 'approved'
        ORDER BY e.event_date ASC, e.start_time ASC
      `,
      [req.user.id],
    );

    res.json({
      events: result.rows.map(formatEvent),
    });
  } catch (error) {
    next(error);
  }
});

/*
  GET /api/events/mine

  Returns every non-demo event created by the logged-in user,
  including pending and rejected submissions.
*/
eventsRouter.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
        SELECT
          ${eventColumns}
        FROM events e
        WHERE e.created_by = $1
          AND e.is_demo = FALSE
        ORDER BY e.created_at DESC
      `,
      [req.user.id],
    );

    res.json({
      events: result.rows.map(formatEvent),
    });
  } catch (error) {
    next(error);
  }
});

/*
  GET /api/events/moderation

  Returns events for the admin moderation queue.

  Supported query values:
  - pending
  - approved
  - rejected
  - all
*/
eventsRouter.get(
  "/moderation",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    const requestedStatus = req.query.status ?? "pending";

    if (
      requestedStatus !== "all" &&
      !MODERATION_STATUSES.has(requestedStatus)
    ) {
      return res.status(400).json({
        error: "Invalid moderation status.",
      });
    }

    const values = [];
    let statusFilter = "";

    if (requestedStatus !== "all") {
      values.push(requestedStatus);
      statusFilter = "AND e.moderation_status = $1";
    }

    try {
      const result = await client.query(
        `
          SELECT
            ${eventColumns},
            u.username AS creator_username,
            u.email AS creator_email
          FROM events e
          LEFT JOIN users u
            ON u.id = e.created_by
          WHERE e.is_demo = FALSE
            ${statusFilter}
          ORDER BY
            CASE
              WHEN e.moderation_status = 'pending' THEN 0
              WHEN e.moderation_status = 'rejected' THEN 1
              ELSE 2
            END,
            e.created_at ASC
        `,
        values,
      );

      res.json({
        events: result.rows.map(formatEvent),
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
  GET /api/events/:id

  Returns one approved public event.
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
          AND e.moderation_status = 'approved'
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
  } catch (error) {
    next(error);
  }
});

/*
  POST /api/events

  Creates a pending user event submission.
*/
eventsRouter.post("/", requireAuth, async (req, res, next) => {
  const eventInput = createEventInput(req.body);
  const validationError = validateEventInput(eventInput);

  if (validationError) {
    return res.status(400).json({
      error: validationError,
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
          end_time,
          moderation_status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          'pending'
        )
      `,
      [
        id,
        req.user.id,
        eventInput.title,
        eventInput.description,
        eventInput.location,
        eventInput.eventDate,
        eventInput.startTime,
        eventInput.endTime,
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
      message: "Your event was submitted for review.",
      event: formatEvent(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
});

/*
  POST /api/events/:id/attendance

  Adds an approved event to the logged-in user's Rooted calendar.
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
          AND moderation_status = 'approved'
      `,
      [req.params.id],
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: "Approved event not found.",
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
  } catch (error) {
    next(error);
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
  } catch (error) {
    next(error);
  }
});

/*
  PATCH /api/events/:id/moderation

  Allows an administrator to approve or reject a user event.
*/
eventsRouter.patch(
  "/:id/moderation",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    if (rejectInvalidEventId(req, res)) {
      return;
    }

    const status = normalizeRequiredString(req.body.status).toLowerCase();
    const moderationNote = normalizeOptionalString(
      req.body.moderationNote,
    );

    if (!REVIEW_DECISIONS.has(status)) {
      return res.status(400).json({
        error: "Status must be approved or rejected.",
      });
    }

    if (status === "rejected" && !moderationNote) {
      return res.status(400).json({
        error: "Explain why the event was rejected.",
      });
    }

    if (moderationNote && moderationNote.length > 1000) {
      return res.status(400).json({
        error: "The moderation explanation must be 1,000 characters or fewer.",
      });
    }

    try {
      const updateResult = await client.query(
        `
          UPDATE events
          SET
            moderation_status = $1,
            moderation_note = $2,
            moderated_by = $3,
            moderated_at = NOW(),
            updated_at = NOW()
          WHERE id = $4
            AND is_demo = FALSE
          RETURNING id
        `,
        [
          status,
          moderationNote,
          req.user.id,
          req.params.id,
        ],
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({
          error: "User event not found.",
        });
      }

      const result = await client.query(
        `
          SELECT
            ${eventColumns},
            u.username AS creator_username,
            u.email AS creator_email
          FROM events e
          LEFT JOIN users u
            ON u.id = e.created_by
          WHERE e.id = $1
        `,
        [req.params.id],
      );

      res.json({
        message:
          status === "approved"
            ? "Event approved and published."
            : "Event rejected.",
        event: formatEvent(result.rows[0]),
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
  PATCH /api/events/:id

  Allows the event creator to edit their submission.
  Every edit returns the event to pending review.
*/
eventsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  if (rejectInvalidEventId(req, res)) {
    return;
  }

  try {
    const existingResult = await client.query(
      `
        SELECT
          title,
          description,
          location,
          TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date,
          TO_CHAR(start_time, 'HH24:MI') AS start_time,
          TO_CHAR(end_time, 'HH24:MI') AS end_time
        FROM events
        WHERE id = $1
          AND created_by = $2
          AND is_demo = FALSE
      `,
      [req.params.id, req.user.id],
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found or you do not have permission.",
      });
    }

    const eventInput = mergeEventInput(
      existingResult.rows[0],
      req.body,
    );

    const validationError = validateEventInput(eventInput);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    await client.query(
      `
        UPDATE events
        SET
          title = $1,
          description = $2,
          location = $3,
          event_date = $4,
          start_time = $5,
          end_time = $6,
          moderation_status = 'pending',
          moderation_note = NULL,
          moderated_by = NULL,
          moderated_at = NULL,
          updated_at = NOW()
        WHERE id = $7
          AND created_by = $8
      `,
      [
        eventInput.title,
        eventInput.description,
        eventInput.location,
        eventInput.eventDate,
        eventInput.startTime,
        eventInput.endTime,
        req.params.id,
        req.user.id,
      ],
    );

    const result = await client.query(
      `
        SELECT
          ${eventColumns}
        FROM events e
        WHERE e.id = $1
      `,
      [req.params.id],
    );

    res.json({
      message: "Event updated and submitted for review.",
      event: formatEvent(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
});

/*
  DELETE /api/events/:id

  Allows the event creator to permanently delete their submission.
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
          AND is_demo = FALSE
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
      eventId: result.rows[0].id,
      deleted: true,
    });
  } catch (error) {
    next(error);
  }
});

export default eventsRouter;
