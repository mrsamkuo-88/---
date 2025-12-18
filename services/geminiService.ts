import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserPreferences } from "../types";

const SYSTEM_INSTRUCTION = `
You are the AI engine for "Dao Teng Life 道騰生活-美食佳餚DIY", a premium cooking app.
Your goal is to generate structured recipe data.
Always respond in TRADITIONAL CHINESE (Taiwan).

Rules:
1. Steps must be detailed and descriptive (40-80 chars) to guide beginners clearly.
2. Include specific visual "success tips" (e.g., color changes, smell, texture).
3. Ingredients should include colorHex for 3D rendering (approximate color of the ingredient).
4. Strictly follow the requested JSON schema.
5. If the user gives a time limit, ensure totalTimeMinutes respects it.
6. MANDATORY: Provide a dedicated 'sauce' section with ingredients and mixing instructions. The sauce is the soul of the dish.
`;

export const generateRecipes = async (prefs: UserPreferences): Promise<Recipe[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct prompt based on preferences
    let prompt = "請推薦 3 道適合新手的美味料理，請特別注重醬汁的調配與細節。";
    if (prefs.ingredientsOnHand) prompt += ` 我手邊有: ${prefs.ingredientsOnHand}。`;
    if (prefs.timeLimit) prompt += ` 我只有 ${prefs.timeLimit} 分鐘。`;
    if (prefs.desiredCuisine && prefs.desiredCuisine.length > 0) prompt += ` 我想吃 ${prefs.desiredCuisine.join('或')}。`;
    if (prefs.mood) prompt += ` 我的心情是: ${prefs.mood}。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              cuisine: { type: Type.STRING },
              difficulty: { type: Type.NUMBER },
              prepTimeMinutes: { type: Type.NUMBER },
              cookTimeMinutes: { type: Type.NUMBER },
              totalTimeMinutes: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    shape: { type: Type.STRING },
                    texture: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    colorHex: { type: Type.STRING },
                  }
                }
              },
              sauce: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                         name: { type: Type.STRING },
                         amount: { type: Type.STRING }
                      }
                    }
                  },
                  mixInstruction: { type: Type.STRING }
                }
              },
              tasteProfile: {
                type: Type.OBJECT,
                properties: {
                  salty: { type: Type.NUMBER },
                  acidic: { type: Type.NUMBER },
                  sweet: { type: Type.NUMBER },
                  spicy: { type: Type.NUMBER },
                  bitter: { type: Type.NUMBER },
                }
              },
              cookingMethods: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.NUMBER },
                    instruction: { type: Type.STRING },
                    successTip: { type: Type.STRING },
                    durationSeconds: { type: Type.NUMBER },
                    heatLevel: { type: Type.STRING, enum: ['大火', '中火', '小火', '關火'] }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Ensure unique IDs
      return data.map((r: any, idx: number) => ({ ...r, id: `gen-${Date.now()}-${idx}` }));
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateDishImage = async (dishName: string): Promise<string | null> => {
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A high-quality, professional food photography shot of ${dishName}. Delicious, appetizing, 4k resolution, studio lighting, beautiful plating. Close up.` }
          ]
        },
        config: {
          // No responseMimeType for image gen on this model
        }
     });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          return `data:image/png;base64,${base64String}`;
        }
     }
     return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}
