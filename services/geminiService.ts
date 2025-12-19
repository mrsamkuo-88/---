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
7. CRITICAL: If the user provides specific ingredients, the recipes MUST feature them as the main ingredient. Do not ignore user input.
`;

// Helper to safely get API Key from LocalStorage (Client) or Env (Build/Server)
const getApiKey = (): string | undefined => {
  // 1. Check LocalStorage (User manually entered key)
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey) return localKey;
  }

  // 2. Check Environment Variable
  try {
    return typeof process !== 'undefined' ? process.env.API_KEY:AIzaSyA8O6OhT3PL0lchc415sTCEqYU85iWrP5U;
  } catch (e) {
    return undefined;
  }
};

export const generateRecipes = async (prefs: UserPreferences): Promise<Recipe[]> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API Key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct prompt based on preferences
    let prompt = "請推薦 3 道適合新手的美味料理，請特別注重醬汁的調配與細節。";
    
    if (prefs.ingredientsOnHand && prefs.ingredientsOnHand.trim() !== '') {
        prompt += ` 使用者指定冰箱現有食材: "${prefs.ingredientsOnHand}"。請務必在推薦的食譜中包含這些食材，並以此為核心設計菜單。`;
    }
    
    if (prefs.timeLimit) prompt += ` 烹飪時間限制: ${prefs.timeLimit} 分鐘。`;
    
    if (prefs.desiredCuisine && prefs.desiredCuisine.length > 0) {
        prompt += ` 使用者想吃的料理類型: ${prefs.desiredCuisine.join(' 或 ')}。`;
    }
    
    if (prefs.mood) prompt += ` 使用者當前心情: ${prefs.mood}，請推薦符合此心境的菜餚。`;

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
     const apiKey = getApiKey();
     if (!apiKey) return null;

     const ai = new GoogleGenAI({ apiKey });
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A high-quality, professional food photography shot of ${dishName}. Delicious, appetizing, 4k resolution, studio lighting, beautiful plating. Close up. Food magazine style.` }
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