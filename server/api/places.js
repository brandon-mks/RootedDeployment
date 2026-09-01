import express from "express";

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
router.get("/", async (req, res, next) => {
    if(!req.body) {
        res.status(400).send("Request is missing body object.")
    } else if(!req.body.location || !req.body.tags) {
        res.status(400).send("Request is missing a location or tags field.")
    } else if(!req.body.location.latitude || !req.body.location.longitude) {
        res.status(400).send("Request is missing either latitude or longitude coordinate.")
    } 

    const { location } = req.body.location;
    const { tags } = req.body.tags;

    const res = await getBusByLocTags(location, tags);
    const data = res.places;
    res.status(200).send(data);
})

export default router;