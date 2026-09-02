import express from "express";
import { getBusinesses, getBusinessById } from "../db/queries/businesses.js";

const router = express.Router();

/**
 * GET /api/businesses
 *
 * Returns businesses stored in PostgreSQL.
 *
 * Only useful after setting up DB and routes
 * to check location info internally and not
 * strictly through the google places API
 * request ie. including Haversine equations
 * to find closest places that match
 */
router.get("/", async (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit, 10);

  if (req.query.limit !== undefined && (!Number.isInteger(requestedLimit) || requestedLimit < 1)) {
    return res.status(400).json({
      error: "Limit must be a positive integer",
    });
  }

  const limit = requestedLimit > 50 ? 50 : requestedLimit || undefined;

  try {
    const businesses = await getBusinesses({ limit });

    return res.json({
      businesses,
      total: businesses.length,
      limit: limit ?? null,
    });
  } catch (error) {
    console.error("Unable to retrieve businesses:", error);

    return res.status(500).json({
      error: "Unable to retrieve businesses",
    });
  }
});

/**
 * GET /api/businesses/:businessId
 *
 * Returns one business using its Google Place business ID.
 */
router.get("/:businessId", async (req, res) => {
  const businessId = req.params.businessId;
  try {
    const business = await getBusinessById(businessId);

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    return res.json({
      business,
    });
  } catch (error) {
    console.error("Unable to retrieve business:", error);

    return res.status(500).json({
      error: "Unable to retrieve business",
    });
  }
});

export default router;
