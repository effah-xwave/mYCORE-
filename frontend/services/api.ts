import { AIRoadmap, InterestType } from "../types";

const API_URL = "http://localhost:5000/api";

export const api = {
  generateRoutine: async (
    interests: InterestType[],
    goals: Record<string, string>,
  ): Promise<AIRoadmap> => {
    try {
      const response = await fetch(`${API_URL}/generate-routine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests, goals }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate routine");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error", error);
      // Fallback to empty/mock if offline
      return {
        summary: "Offline Mode",
        strategy:
          "We couldn't connect to the AI brain, so here are some standard habits.",
        habits: [],
      };
    }
  },
};
