import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const getAI = (customKey?: string) => {
  // Use customKey if provided and not empty, otherwise fallback to environment variables
  const key = (customKey && customKey.trim() !== "") ? customKey : (process.env.GEMINI_API_KEY || process.env.API_KEY);
  
  if (!key || key === "MY_GEMINI_API_KEY" || key === "YOUR_API_KEY") {
    console.error("GEMINI_API_KEY is missing or using a placeholder value.");
    throw new Error("GEMINI_API_KEY is not set or invalid. Please check your Secrets or Settings.");
  }
  
  const keyPreview = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : "****";
  console.log(`Initializing GoogleGenAI with key: ${keyPreview} (length: ${key.length})`);
  return new GoogleGenAI({ apiKey: key });
};

// API Routes
app.post("/api/generate-writing", async (req, res) => {
  try {
    const { config, customKey } = req.body;
    const ai = getAI(customKey);
    const model = "gemini-3-flash-preview";

    const prompt = `
      Write a ${config.length} ${config.type} about "${config.topic}".
      Tone: ${config.tone}
      ${config.additionalInstructions ? `Additional Instructions: ${config.additionalInstructions}` : ""}

      Please provide a title and the body content.
      Format your response as a JSON object with "title" and "body" fields.
      The "body" should be in Markdown format.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error generating writing:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refine-writing", async (req, res) => {
  try {
    const { content, instruction, customKey } = req.body;
    const ai = getAI(customKey);
    const model = "gemini-3-flash-preview";

    const prompt = `
      Refine the following content based on this instruction: "${instruction}"
      
      Content:
      ${content}

      Provide the updated content in Markdown format.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error refining writing:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-ad", async (req, res) => {
  try {
    const { config, customKey } = req.body;
    const ai = getAI(customKey);
    const model = "gemini-3-flash-preview";

    const prompt = `
      Generate a marketing script for a ${config.duration} video advertisement.
      Product: ${config.productName}
      Brand: ${config.brand}
      Description: ${config.description}
      Price: ${config.price}
      Target Audience: ${config.targetAudience}
      Ad Style: ${config.style}

      The script should include:
      1. A catchy title for the ad.
      2. A scene-by-scene breakdown (Visuals and Voiceover).
      3. A clear Call to Action (CTA).

      Format your response as a JSON object with "title" and "script" (Markdown) fields.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error generating ad:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile("dist/index.html", { root: "." });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
