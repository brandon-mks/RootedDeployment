import express from "express";
import client from "../db/client.js";
import { requireAuth } from "./users.js";
import { v4 as uuidv4 } from "uuid";

const visitedRouter = express.Router();

async function resolveBusiness(identifier) {
  const result = await client.query(
    `
      SELECT
        id,
        business_id
      FROM businesses
      WHERE business_id = $1
         OR id::text = $1
      LIMIT 1
    `,
    [identifier],
  );

  return result.rows[0] ?? null;
}

/*
  GET /api/visited

  Returns the Google Place IDs for businesses the logged-in user
  has marked as visited.
*/
visitedRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await client.query(
      `
        SELECT b.business_id
        FROM business_visits bv
        JOIN businesses b
          ON b.id = bv.business_id
        WHERE bv.user_id = $1
        ORDER BY b.business_name
      `,
      [req.user.id],
    );

    res.json({
      businesses: result.rows.map((row) => row.business_id),
      events: [],
    });
  } catch (error) {
    next(error);
  }
});

/*
  POST /api/visited

  Toggles the visited state for a business.

  Event calendar membership remains exclusively managed through
  /api/events/:id/attendance.
*/
visitedRouter.post("/", requireAuth, async (req, res, next) => {
  const { itemId, itemType } = req.body;

  if (!itemId || !itemType) {
    return res.status(400).json({
      message: "itemId and itemType are required.",
    });
  }

  if (itemType !== "business") {
    return res.status(400).json({
      message: "Visited status currently supports businesses only.",
    });
  }

  try {
    const business = await resolveBusiness(itemId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    const existing = await client.query(
      `
        SELECT id
        FROM business_visits
        WHERE user_id = $1
          AND business_id = $2
      `,
      [req.user.id, business.id],
    );

    if (existing.rows.length > 0) {
      await client.query(
        `
          DELETE FROM business_visits
          WHERE user_id = $1
            AND business_id = $2
        `,
        [req.user.id, business.id],
      );

      return res.json({
        itemId: business.business_id,
        visited: false,
        message: "Removed from visited businesses.",
      });
    }

    await client.query(
      `
        INSERT INTO business_visits (
          id,
          user_id,
          business_id
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, business_id) DO NOTHING
      `,
      [uuidv4(), req.user.id, business.id],
    );

    return res.status(201).json({
      itemId: business.business_id,
      visited: true,
      message: "Marked as visited.",
    });
  } catch (error) {
    next(error);
  }
});

export default visitedRouter;
