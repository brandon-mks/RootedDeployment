import express from "express";
import { dummyData } from "../db/db_dummy_data.js";

const router = express.Router();

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
  location: place.location ? { lat: place.location.latitude, lng: place.location.longitude } : null,
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
  const source = category ? dummyData[category] : Object.values(dummyData).flat();

  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const requestedPage = Number.parseInt(req.query.page, 10);

  // Keep each page between 1 and 50 records.
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 6;

  // Default to page one and prevent page numbers below one.
  const page = Number.isInteger(requestedPage) ? Math.max(requestedPage, 1) : 1;

  const total = source.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const places = source.slice(offset, offset + limit).map(formatPlace);

  res.json({
    places,
    total,
    limit,
    page,
    totalPages,
    category: category ?? "all",
  });
});
