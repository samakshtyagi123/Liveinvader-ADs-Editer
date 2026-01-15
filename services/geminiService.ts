import { GoogleGenAI, ChatSession, Chat } from "@google/genai";
import { LIFEINVADER_POLICY_DATA } from "../constants";

let chatSession: Chat | null = null;

export const startChat = async (): Promise<Chat | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        chatSession = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: LIFEINVADER_POLICY_DATA,
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        return chatSession;
    } catch (error) {
        console.error("Failed to initialize Gemini:", error);
        return null;
    }
};

export const resetChatSession = () => {
    chatSession = null;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
    if (!chatSession) {
        await startChat();
    }
    
    if (!chatSession) {
        throw new Error("AI Service unavailable. Check API configuration.");
    }

    try {
        const response = await chatSession.sendMessage({ message });
        return response.text || "Error: No response generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};