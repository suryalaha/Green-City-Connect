
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an AI assistant for "Green City Connect", a solid waste management app. Your goal is to help users with their queries.
Be friendly, concise, and helpful.
If the user's issue cannot be solved with the information you have, or if they express a desire to speak to a person, you MUST offer them the option to talk to a human partner.
When you offer this, provide the phone number 9064201746 in a clear and accessible way.
Do not answer questions unrelated to waste management, recycling, composting, account issues, payments, or app features.`;

export const getChatbotResponse = async (message: string): Promise<string> => {
  try {
    // FIX: Per coding guidelines, assume API_KEY is always present. The try/catch block will handle initialization failures.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, I'm having trouble connecting. Please try again later.";
  }
};
