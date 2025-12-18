export enum CuisineType {
  TAIWANESE = '台式',
  WESTERN = '西式',
  JAPANESE = '日式',
  KOREAN = '韓式',
  SOUTHEAST_ASIAN = '東南亞',
  DESSERT = '甜點',
}

export enum CookingMethod {
  FRY = '炸',
  PAN_FRY = '煎',
  STEAM = '蒸',
  BOIL = '煮',
  ROAST = '烤',
  STIR_FRY = '炒',
}

export interface TasteProfile {
  salty: number; // 1-5
  acidic: number;
  sweet: number;
  spicy: number;
  bitter: number;
}

export interface Ingredient3D {
  name: string;
  shape: string; // e.g., '切丁', '切片'
  texture: string; // e.g., '生', '酥脆'
  amount: string; // e.g., '200g'
  colorHex: string; // For 3D visualization
}

export interface CookingStep {
  stepNumber: number;
  instruction: string; // More detailed
  successTip: string;
  durationSeconds?: number;
  heatLevel?: '大火' | '中火' | '小火' | '關火';
}

export interface Sauce {
  name: string;
  ingredients: { name: string; amount: string }[];
  mixInstruction: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: CuisineType;
  difficulty: number; // 1-5
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  ingredients: Ingredient3D[];
  sauce?: Sauce; // Optional sauce section
  tasteProfile: TasteProfile;
  cookingMethods: CookingMethod[];
  steps: CookingStep[];
  calories?: number;
  imageUrl?: string; // Generated image
}

export interface UserPreferences {
  timeLimit?: number;
  desiredCuisine?: CuisineType[];
  ingredientsOnHand?: string;
  mood?: string;
}