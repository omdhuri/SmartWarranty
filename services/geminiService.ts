/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { OcrResult } from '../types';

// Access API Key from Vite env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''; // Future fallback

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const analyzeProductImage = async (base64Image: string): Promise<OcrResult> => {
  if (!GEMINI_API_KEY) {
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

    // Helper to try models in sequence
    const generateWithFallback = async (cleanBase64: string) => {
      const modelsToTry = ['gemini-2.0-flash-001', 'gemini-2.5-flash-001', 'gemini-flash-latest'];

      for (const model of modelsToTry) {
        try {
          console.log(`Attempting with model: ${model}`);
          const response = await ai.models.generateContent({
            model: model,
            contents: {
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                {
                  text: `Analyze this image of a product label or receipt. Extract the following information in strict JSON format:
                                - productName: The full name of the product.
                                - brand: The manufacturer or brand name.
                                - modelNumber: The specific model number or ID.
                                - purchaseDate: The purchase date in YYYY-MM-DD format (if visible, otherwise null).
                                - warrantyDuration: Estimated warranty in months (default to 12 if unknown but electronics).`
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
          return response;
        } catch (error: any) {
          console.warn(`Model ${model} failed:`, error.message);
          if (model === modelsToTry[modelsToTry.length - 1]) throw error; // Throw if last model fails
        }
      }
      throw new Error("All models failed");
    };

    const response = await generateWithFallback(cleanBase64);

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    console.log("Gemini Raw Response:", text);
    const data = JSON.parse(text);

    return {
      productName: data.productName || '',
      brand: data.brand || '',
      modelNumber: data.modelNumber || '',
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyDuration: data.warrantyDuration || 12
    } as OcrResult;

  } catch (error) {
    console.error("Gemini OCR Error:", error);

    // Future Groq Fallback Logic would go here
    // if (GROQ_API_KEY) { ... try Groq ... }

    throw new Error("Failed to analyze image");
  }
};