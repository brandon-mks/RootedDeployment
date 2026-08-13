import express from "express";
import { generateAiResponse } from "../services/ai.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res
      .status(400)
      .json({ error: "Payload must contain a valid messages array." });
  }

  try {
    const aiMessage = await generateAiResponse(messages);
    return res.json({ message: aiMessage });
  } catch (error) {
    console.error("Chatbot Route Error:", error.message);
    return res.status(500).json({ error: "Internal AI processing error." });
  }
});

export default router;
