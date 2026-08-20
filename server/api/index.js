import express from "express";
import cors from "cors";
import "dotenv/config";

import usersRouter from "./users.js";
import placesRouter from "./places.js";
import chatbotRouter from "./chatbot.js";
import businessesRouter from "./businesses.js";
import favoritesRouter from "./favorites.js";
import reviewsRouter from "./reviews.js";
import eventsRouter from "./events.js";
import profileRouter from "./profile.js";

const router = express.Router();

//define api routes here
router.use("/users", usersRouter);
router.use("/businesses", businessesRouter);
router.use("/places", placesRouter);
router.use("/chatbot", chatbotRouter);
router.use("/favorites", favoritesRouter);
router.use("/reviews", reviewsRouter);
router.use("/events", eventsRouter);
router.use("/profile", profileRouter);

export default router;
