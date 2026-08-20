import "dotenv/config";
import { getBusinesses } from "../db/business.js";

export const generateAiResponse = async (messages) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in server environment variables.");
  }

  const businesses = await getBusinesses();

  // 1.Brand Identity
  const systemPrompt = {
    role: "system",
    content: `You are the official Rooted Community Assistant. 
    Your tone is warm, neighborly, and knowledgable about local business and community events.
    Keep responses collaboritive, helpful, and organized using bullet points. 
    Answer questions using the Rooted information provided below.

    IMPORTANT:
    - Do not invent businesses or information.
    - If the Rooted information does not contain an answer, say that you don't have that information.
    - When recommending a business, only recommend businesses found in the Rooted data.
    Reference being apart of the community when fitting.
    
    ROOTED BUSINESSES:
      ${JSON.stringify(businesses)}
    `,
  };

  // 2.Limit Chat
  const maxContextHistory = 10;
  const slidingWindowMessages = messages.slice(-maxContextHistory);

  // 3.Combines Guidelines
  const fullConversationContext = [systemPrompt, ...slidingWindowMessages];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: fullConversationContext,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `OpenAI responded with code ${response.status}`;

    try {
      const errorBody = JSON.parse(errorText);
      if (errorBody.error?.message) {
        errorMessage = errorBody.error.message;
      }
    } catch {
      // Leaves errorMessage as the default fallback string if JSON parsing fails
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.choices[0].message; // Returns { role: "assistant", content: "..." }
};
