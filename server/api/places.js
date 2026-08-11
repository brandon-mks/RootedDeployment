import express from "express";
import { dummyData } from "../db/db_dummy_data.js";

const router = express.Router();

/**
 * Temporary Places API
 *
 * The current place records are hard-coded in db_dummy_data.js.
 * They are not stored in the database and are not fetched live from Google.
 *
 * This route gives the frontend a normal API endpoint to use while the
 * real database or Google Places integration is being developed.
 *
 * Future goal:
 * Replace the dummyData source below with a database query or external
 * API request without changing the response shape expected by the frontend.
 */

/**
 * IMPORTANT:
 * This category order must match the order used by the dummyData export:
 *
 * [restaurants, museums, hiking_areas, farmers_markets, live_music_venues]
 */
const categories = Object.keys(dummyData).filter((key) => dummyData[key].length > 0);

/**
 * Convert a large Google Places-style object into the smaller object
 * currently needed by the frontend.
 *
 * This prevents us from sending thousands of unnecessary fields to the
 * browser and gives the frontend a stable data structure.
 */
const formatPlace = (place) => ({
  id: place.id,
  name: place.displayName?.text ?? "Unnamed place",
  category: place.primaryType ?? "place",
  address: place.formattedAddress ?? "",
  rating: place.rating ?? null,
  website: place.websiteUri ?? null,
  location: place.location ?? null,
});

/**
 * GET /api/places
 *
 * Optional query parameters:
 *
 * category:
 *   /api/places?category=restaurants
 *
 * limit:
 *   /api/places?limit=6
 *
 * Both:
 *   /api/places?category=museums&limit=6
 */
router.get("/", (req, res) => {
  const category = req.query.category?.toLowerCase();

  // Return a helpful message rather than silently returning no records.
  if (category && !categories.includes(category)) {
    return res.status(400).json({
      error: "Invalid category",
      availableCategories: categories,
    });
  }

  // With no category, combine all five arrays into one list.
  const source = category
    ? dummyData[category]
    : Object.values(dummyData).flat();

  const requestedLimit = Number.parseInt(req.query.limit, 10);

  // Default to 12 results and prevent a request from returning more than 50.
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 50)
    : 12;

  const places = source.slice(0, limit).map(formatPlace);

  res.json({
    places,
    total: source.length,
    limit,
    category: category ?? "all",
  });
});

export default router;