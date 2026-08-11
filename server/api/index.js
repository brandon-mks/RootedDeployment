import express from "express";

import usersRouter from "./users.js";
import placesRouter from "./places.js";

const router = express.Router();

//define api routes here
router.use("/users", usersRouter);
router.use("/places", placesRouter);

export default router;
