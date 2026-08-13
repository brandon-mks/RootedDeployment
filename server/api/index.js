import express from "express";
import cors from "cors";
import "dotenv/config";

import usersRouter from "./users.js";
import placesRouter from "./places.js";
import chatbotRouter from "./chatbot.js";

const router = express.Router();

//define api routes here
router.use("/users", usersRouter);
router.use("/places", placesRouter);
router.use("/chatbot", chatbotRouter);

export default router;
