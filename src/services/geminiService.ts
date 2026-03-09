import { AdConfig, WritingConfig } from "../types";

export const generateWriting = async (config: WritingConfig, customKey?: string) => {
  const response = await fetch("/api/generate-writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config, customKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate writing");
  }

  return response.json();
};

export const refineWriting = async (content: string, instruction: string, customKey?: string) => {
  const response = await fetch("/api/refine-writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, instruction, customKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to refine writing");
  }

  const data = await response.json();
  return data.text;
};

export const generateAdScript = async (config: AdConfig, customKey?: string) => {
  const response = await fetch("/api/generate-ad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config, customKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate ad script");
  }

  return response.json();
};
