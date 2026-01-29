
import { GoogleGenAI, Type } from "@google/genai";
import { LanguageCode, Exercise } from "../types.ts";

export async function generateExercise(language: LanguageCode, level: string): Promise<Partial<Exercise> | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a touch typing practice text in ${language}. 
      Level: ${level}. 
      Ensure it focuses on common words and varied character usage for that specific language. 
      Keep it around 30-50 words.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    if (!data.title || !data.content) {
      throw new Error("Invalid response structure from AI");
    }

    return {
      title: data.title,
      content: data.content,
      language,
      level: level as any
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
