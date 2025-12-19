
import { GoogleGenAI, Type } from "@google/genai";
import { Service, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeServiceHealth = async (service: Service): Promise<AIInsight> => {
  const historyString = service.history
    .map(h => `[${new Date(h.timestamp).toISOString()}] Latency: ${h.latency}ms, Status: ${h.status}`)
    .join('\n');

  const prompt = `
    Analyze the following heartbeat and latency data for a service named "${service.name}".
    Provide a professional technical summary and recommendations.
    
    Service Data:
    ${historyString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief summary of the service health." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Actionable technical recommendations." 
            },
            anomaliesFound: { type: Type.BOOLEAN, description: "True if any latency spikes or downtime patterns were detected." }
          },
          required: ["summary", "recommendations", "anomaliesFound"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "AI Analysis currently unavailable. Basic metrics show the service is " + service.status,
      recommendations: ["Check manual logs", "Verify endpoint connectivity"],
      anomaliesFound: false
    };
  }
};
