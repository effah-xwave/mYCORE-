import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to myCORE Backend!" });
});

app.post("/api/generate-routine", async (req, res) => {
  try {
    const { interests, goals } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "Missing API Key" });
      return;
    }

    const prompt = `
      You are an expert productivity coach.
      Create a personalized daily routine for a user with these focus areas: ${interests.join(", ")}.
      Their specific goals are: ${JSON.stringify(goals)}.

      Output strictly valid JSON with no markdown formatting. Structure:
      {
        "summary": "One sentence summary of the approach",
        "strategy": "Two sentence explanation of the strategy",
        "habits": [
          {
            "id": "unique_string",
            "name": "Habit Name",
            "icon": "Lucide Icon Name (e.g. Activity, BookOpen, Moon, Sun, Droplets)",
            "interest": "One of: ${interests.join(", ")}",
            "schedule": "Daily" or "Weekdays" or "Weekends",
            "triggerType": "MANUAL" or "APP_OPEN" or "LOCATION" or "SCREEN_TIME",
            "streak": 0,
            "goal": { "target": number, "unit": "string" } (Optional)
          }
        ]
      }
      Generate 4-6 high-impact habits.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean markdown if present
    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanJson);
    res.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate routine" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
