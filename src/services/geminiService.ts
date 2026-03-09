import { GoogleGenAI } from "@google/genai";
import { AdConfig, WritingConfig } from "../types";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const generateWriting = async (config: WritingConfig) => {
  const ai = getAI();
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

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { title: "Untitled", body: response.text };
  }
};

export const refineWriting = async (content: string, instruction: string) => {
  const ai = getAI();
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

  return response.text;
};

export const generateAdScript = async (config: AdConfig) => {
  const ai = getAI();
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

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { title: "Untitled Ad", script: response.text };
  }
};
