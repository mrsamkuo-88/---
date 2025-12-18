import { Recipe, CuisineType, CookingMethod } from './types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'mock-1',
    name: '黃金脆皮煎餃',
    description: '經典台式風味，底部焦脆，內餡多汁。適合新手的成就感料理。',
    cuisine: CuisineType.TAIWANESE,
    difficulty: 2,
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    totalTimeMinutes: 25,
    ingredients: [
      { name: '豬絞肉', shape: '細碎', texture: '生', amount: '200g', colorHex: '#fca5a5' },
      { name: '高麗菜', shape: '切末', texture: '脆', amount: '100g', colorHex: '#86efac' },
      { name: '水餃皮', shape: '圓形片狀', texture: '軟', amount: '20片', colorHex: '#fef3c7' },
    ],
    sauce: {
      name: '蒜味醬油膏',
      ingredients: [
        { name: '醬油膏', amount: '2大匙' },
        { name: '蒜末', amount: '1瓣' },
        { name: '香油', amount: '少許' }
      ],
      mixInstruction: '將蒜末壓泥，與醬油膏、香油混合均勻即可。'
    },
    tasteProfile: { salty: 3, acidic: 1, sweet: 2, spicy: 0, bitter: 0 },
    cookingMethods: [CookingMethod.PAN_FRY, CookingMethod.STEAM],
    steps: [
      { stepNumber: 1, instruction: '將絞肉與蔬菜混合，加入少許鹽巴與白胡椒粉，順時針攪拌至有黏性產生', successTip: '肉餡呈現絲狀纖維，不再散開', heatLevel: '關火' },
      { stepNumber: 2, instruction: '取一片水餃皮，中間放入適量餡料，邊緣抹水，對折捏緊封口', successTip: '確保無縫隙以免湯汁流失', heatLevel: '關火' },
      { stepNumber: 3, instruction: '平底鍋熱鍋下油，將餃子整齊排列，中小火煎至底部定型', successTip: '翻看底部呈現均勻的淺黃色', heatLevel: '中火', durationSeconds: 120 },
      { stepNumber: 4, instruction: '倒入麵粉水（水:麵粉=10:1）至餃子一半高度，蓋上鍋蓋悶煮', successTip: '聽見水份收乾的滋滋聲，且邊緣出現冰花', heatLevel: '中火', durationSeconds: 300 },
    ],
    calories: 450
  },
  {
    id: 'mock-2',
    name: '日式照燒雞腿',
    description: '鹹甜醬汁包覆軟嫩雞腿肉，下飯首選。',
    cuisine: CuisineType.JAPANESE,
    difficulty: 3,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    ingredients: [
      { name: '去骨雞腿', shape: '整塊', texture: '生', amount: '300g', colorHex: '#f87171' },
      { name: '白芝麻', shape: '顆粒', texture: '熟', amount: '少許', colorHex: '#fdf4ff' },
    ],
    sauce: {
      name: '黃金照燒醬',
      ingredients: [
        { name: '醬油', amount: '2大匙' },
        { name: '味醂', amount: '2大匙' },
        { name: '清酒/米酒', amount: '1大匙' },
        { name: '砂糖', amount: '1大匙' }
      ],
      mixInstruction: '將所有液體與砂糖混合，攪拌至糖顆粒完全溶解。'
    },
    tasteProfile: { salty: 4, acidic: 0, sweet: 4, spicy: 0, bitter: 0 },
    cookingMethods: [CookingMethod.PAN_FRY, CookingMethod.BOIL],
    steps: [
      { stepNumber: 1, instruction: '雞腿肉洗淨擦乾，皮面朝下入鍋，不放油直接乾煎逼出油脂', successTip: '雞皮呈現金黃酥脆，油脂被逼出', heatLevel: '中火', durationSeconds: 300 },
      { stepNumber: 2, instruction: '翻面煎至肉色變白，用餐巾紙吸去鍋內多餘油脂', successTip: '雞肉表面微焦，鍋底清爽無積油', heatLevel: '小火', durationSeconds: 180 },
      { stepNumber: 3, instruction: '倒入調好的照燒醬汁，蓋鍋蓋悶煮2分鐘確保中心熟透', successTip: '醬汁開始冒大泡泡並變濃稠', heatLevel: '中火', durationSeconds: 120 },
      { stepNumber: 4, instruction: '打開鍋蓋大火收汁，不停將醬汁淋在雞肉上使其上色光亮', successTip: '雞肉呈現光亮琥珀色，醬汁可掛在肉上', heatLevel: '大火', durationSeconds: 60 },
    ],
    calories: 520
  }
];