
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client with the environment variable API key.
// As per guidelines, we assume process.env.API_KEY is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRaceCommentary = async (carName: string, performance: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-energy racing commentator. Give a short, 2-sentence hype commentary for a player who just raced a ${carName} and finished with a ${performance} performance.`,
      config: {
        temperature: 0.8,
        // recommendation: avoid setting maxOutputTokens if not required to prevent blocking.
      }
    });
    // The response.text property directly returns the generated string output.
    return response.text || "Unbelievable race! You pushed that machine to its absolute limit!";
  } catch (error) {
    console.error("Gemini commentary failed:", error);
    return "Great racing out there!";
  }
};

export const getCarLore = async (carName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, cool 1-sentence history snippet about the real-life ${carName}. Make it sound legendary for a car game menu.`,
      config: {
        temperature: 0.7,
      }
    });
    // The response.text property directly returns the generated string output.
    return response.text || "A legend of the asphalt, redesigned for the digital age.";
  } catch (error) {
    console.error("Gemini lore failed:", error);
    return "An engineering masterpiece.";
  }
};
