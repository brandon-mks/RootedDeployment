import express from "express";
import { getBusByLocTags } from "../db/queries/businesses.js";

const router = express.Router();

/** "api/places" route
 *
 * expects body object with the following fields
 *
 * requested google places types:
 * tags: []
 *
 * user coords or search coords:
 * location: {
 *  latitude:
 *  longitude:
 * }
 *
 *
 */
router.post("/", async (req, res, next) => {
  if (!req.body) {
    res.status(400).send("Request is missing body object.");
  } else if (!req.body.location || !req.body.tags) {
    res.status(400).send("Request is missing a location or tags field.");
  } else if (!req.body.location.latitude || !req.body.location.longitude) {
    res.status(400).send("Request is missing either latitude or longitude coordinate.");
  }

  const { location } = req.body;
  const { tags } = req.body;

  const response = await getBusByLocTags(location, tags);
  res.status(200).send(response);
});

export default router;
