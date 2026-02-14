import { GoogleGenAI, Type } from "@google/genai";
import { OcrResult } from '../types';

// NOTE: In a real production app, API calls should be proxied through a backend to protect the key.
// For this frontend-only demo, we assume the environment variable is available.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeProductImage = async (base64Image: string): Promise<OcrResult> => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. Returning mock data.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          productName: "Detected Product (Mock)",
          brand: "Generic Brand",
          modelNumber: "XYZ-1234",
          purchaseDate: new Date().toISOString().split('T')[0],
          warrantyDuration: 12
        });
      }, 1500);
    });
  }

  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image of a product label or receipt. Extract the following information in JSON format:
            - productName (string)
            - brand (string)
            - modelNumber (string)
            - purchaseDate (string, YYYY-MM-DD format if found, otherwise null)
            - warrantyDuration (number, in months, estimated if not explicit based on product type)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, nullable: true },
            brand: { type: Type.STRING, nullable: true },
            modelNumber: { type: Type.STRING, nullable: true },
            purchaseDate: { type: Type.STRING, nullable: true },
            warrantyDuration: { type: Type.NUMBER, nullable: true },
          },
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as OcrResult;

  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("Failed to analyze image");
  }
};