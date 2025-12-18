import React, { useState, useEffect } from 'react';
import { ChefHat, Timer, Search, Sparkles, AlertCircle, ArrowLeft, Flame, Droplets, Camera, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { generateRecipes, generateDishImage } from './services/geminiService';
import { Recipe, CuisineType } from './types';
import { MOCK_RECIPES } from './constants';
import IngredientCube from './components/IngredientCube';
import TasteMatrix from './components/TasteMatrix';
import CookingMode from './components/CookingMode';

type ViewState = 'HOME' | 'SEARCH' | 'RESULTS' | 'DETAIL';

// Helper for safe key access
const hasApiKey = () => {
  try {
    return typeof process !== 'undefined' && !!process.env.API_KEY;
  } catch {
    return false;
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Preference State
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [ingredients, setIngredients] = useState('');
  const [mood, setMood] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);

  // Generate Image when a recipe without image is selected
  useEffect(() => {
    const fetchImage = async () => {
      if (view === 'DETAIL' && selectedRecipe && !selectedRecipe.imageUrl && hasApiKey() && !isDemoMode) {
        setImageLoading(true);
        const url = await generateDishImage(selectedRecipe.name);
        if (url) {
          setSelectedRecipe(prev => prev ? { ...prev, imageUrl: url } : null);
          // Update the recipe in the main list too so we don't fetch again
          setRecipes(prev => prev.map(r => r.id === selectedRecipe.id ? { ...r, imageUrl: url } : r));
        }
        setImageLoading(false);
      }
    };
    fetchImage();
  }, [view, selectedRecipe?.id, isDemoMode]);

  const handleSearch = async () => {
    setLoading(true);
    setView('RESULTS');
    setIsDemoMode(false); // Reset demo mode
    setErrorDetails('');
    
    try {
      if (hasApiKey()) {
        const generated = await generateRecipes({
          timeLimit,
          ingredientsOnHand: ingredients,
          mood,
          desiredCuisine: selectedCuisines
        });
        
        if (generated.length > 0) {
            setRecipes(generated);
        } else {
             throw new Error("AI 回傳了空的食譜列表，請稍後再試。");
        }
      } else {
        console.warn("No API Key detected, using Mock data.");
        throw new Error("API Key 未設定 (Environment Variable Missing)");
      }
    } catch (e: any) {
      console.error("AI Generation failed:", e);
      setRecipes(MOCK_RECIPES); // Fallback
      setIsDemoMode(true);
      // Capture detailed error message for debugging on mobile
      setErrorDetails(e.message || "網路連線異常或 API 配額已滿");
    } finally {
      setLoading(false);
    }
  };

  const toggleCuisine = (c: CuisineType) => {
    if (selectedCuisines.includes(c)) {
      setSelectedCuisines(prev => prev.filter(i => i !== c));
    } else {
      setSelectedCuisines(prev => [...prev, c]);
    }
  };

  if (cookingMode && selectedRecipe) {
    return <CookingMode recipe={selectedRecipe} onClose={() => setCookingMode(false)} />;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('HOME')}>
            <ChefHat className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-black tracking-tighter text-white">
              Dao Teng Life <span className="text-emerald-400">道騰生活-美食佳餚</span>
            </span>
          </div>
          <div className="hidden md:block text-xs font-mono text-slate-500">美食佳餚DIY v1.3</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* HOME VIEW */}
        {view === 'HOME' && (
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 pb-2">
              智慧烹飪，精準美味
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              輸入您的時間、食材或心情，道騰生活智慧引擎將為您規劃完美菜單，提供專業醬汁比例與 3D 視覺化引導。
            </p>
            
            <button 
              onClick={() => setView('SEARCH')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 transition-all duration-200 bg-emerald-500 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 hover:bg-emerald-400"
            >
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              開始探索美食
            </button>

            {/* Featured Cards */}
            <div className="w-full mt-16 text-left">
              <h3 className="text-slate-500 font-bold tracking-widest mb-6">熱門推薦 (FEATURED)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_RECIPES.map(recipe => (
                  <div key={recipe.id} onClick={() => { setSelectedRecipe(recipe); setView('DETAIL'); }}
                    className="bg-slate-800 rounded-2xl p-6 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-300">{recipe.cuisine}</span>
                      <div className="flex items-center text-orange-400 text-xs font-bold">
                        <Timer className="w-3 h-3 mr-1" />
                        {recipe.totalTimeMinutes} min
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{recipe.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{recipe.description}</p>
                    <div className="mt-4 flex gap-2">
                      {recipe.cookingMethods.map(m => (
                        <span key={m} className="text-xs border border-slate-600 text-slate-400 px-2 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEARCH VIEW */}
        {view === 'SEARCH' && (
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Search className="w-6 h-6 mr-2 text-emerald-400" />
              智慧參數設定
            </h2>
            
            <div className="space-y-6">
              {/* Time */}
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">您有多少時間?</label>
                <div className="grid grid-cols-4 gap-3">
                  {[15, 30, 45, 60].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeLimit(t)}
                      className={`py-2 rounded-lg font-medium transition-colors border ${timeLimit === t ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                    >
                      {t} 分
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine */}
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">想吃什麼類型?</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CuisineType).map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCuisines.includes(c) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">冰箱有什麼食材? (選填)</label>
                <input 
                  type="text" 
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="例如：雞蛋、洋蔥、豬肉"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">心情如何? (選填)</label>
                <input 
                  type="text" 
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="例如：想慶祝、有點累想吃清淡"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button 
                onClick={handleSearch}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl text-lg mt-4 transition-colors"
              >
                生成推薦菜單
              </button>
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {view === 'RESULTS' && (
          <div>
             <div className="flex items-center mb-6">
                <button onClick={() => setView('SEARCH')} className="mr-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700"><ArrowLeft className="w-5 h-5 text-slate-300" /></button>
                <h2 className="text-2xl font-bold text-white">推薦結果</h2>
             </div>

             {/* Demo Mode Alert with Diagnostics */}
             {isDemoMode && (
                <div className="bg-slate-800/80 border border-yellow-500/30 text-yellow-100 px-5 py-5 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-yellow-900/10">
                   <div className="flex items-start">
                     <div className="bg-yellow-500/10 p-2 rounded-full mr-4 shrink-0">
                        <WifiOff className="w-6 h-6 text-yellow-400" />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-bold text-lg text-yellow-300 mb-1">已切換至展示模式 (Demo Mode)</h3>
                        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                          系統偵測到 AI 服務連線受限，這通常發生在手機瀏覽器或 API Key 未設定的環境。目前顯示為預設範例，無法根據您的食材（{ingredients || '無'}）生成新食譜。
                        </p>
                        
                        {errorDetails && (
                          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-4 overflow-hidden">
                            <div className="flex items-center text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">
                               <Smartphone className="w-3 h-3 mr-1" /> System Diagnostic Log
                            </div>
                            <code className="text-xs text-red-300 font-mono break-all block">
                               {errorDetails}
                            </code>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={handleSearch}
                              className="text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-5 py-2 rounded-lg font-bold transition-colors flex items-center"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              重試連線
                            </button>
                            <a 
                               href="https://ai.google.dev/gemini-api/docs/api-key" 
                               target="_blank" 
                               rel="noreferrer"
                               className="text-sm border border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-300 px-5 py-2 rounded-lg transition-colors"
                            >
                               檢查 API 設定
                            </a>
                        </div>
                     </div>
                   </div>
                </div>
             )}

             {loading ? (
               <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                 <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="animate-pulse">AI 正在運算最佳烹飪路徑...</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recipes.map((recipe, idx) => (
                   <div key={idx} onClick={() => { setSelectedRecipe(recipe); setView('DETAIL'); }}
                     className="bg-slate-800 group rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-emerald-900/20 transition-all border border-slate-700 hover:border-emerald-500/50">
                      <div className="h-48 bg-slate-700/50 relative overflow-hidden">
                        {recipe.imageUrl ? (
                           <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                             <ChefHat className="w-16 h-16 text-slate-600 group-hover:text-slate-500" />
                           </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-6 right-6">
                           <div className="flex justify-between items-end">
                              <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors drop-shadow-md">{recipe.name}</h3>
                              <span className="text-emerald-400 font-bold text-sm bg-slate-900/80 px-2 py-1 rounded backdrop-blur">{recipe.cuisine}</span>
                           </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between text-slate-400 text-sm mb-4">
                           <div className="flex items-center"><Timer className="w-4 h-4 mr-1"/> {recipe.totalTimeMinutes} min</div>
                           <div className="flex items-center"><Flame className="w-4 h-4 mr-1"/> {recipe.calories ? `${recipe.calories} kcal` : 'N/A'}</div>
                           <div className="flex items-center text-xs border border-slate-600 px-2 py-0.5 rounded">難度 {recipe.difficulty}</div>
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{recipe.description}</p>
                        
                        {/* Mini Taste Bar */}
                        <div className="flex items-center space-x-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(recipe.tasteProfile.salty / 5) * 100}%` }} />
                          <div className="h-full bg-yellow-500" style={{ width: `${(recipe.tasteProfile.sweet / 5) * 100}%` }} />
                          <div className="h-full bg-red-500" style={{ width: `${(recipe.tasteProfile.spicy / 5) * 100}%` }} />
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === 'DETAIL' && selectedRecipe && (
          <div className="animate-in slide-in-from-bottom-10 duration-500 pb-16">
             <button onClick={() => setView('RESULTS')} className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors">
               <ArrowLeft className="w-5 h-5 mr-2" /> 返回結果
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Left Col: Info & Visuals */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 relative overflow-hidden">
                    {/* Main Image Header */}
                    <div className="relative h-64 md:h-80 -mx-8 -mt-8 mb-8 group">
                      {imageLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                          <Sparkles className="w-10 h-10 animate-spin text-emerald-500 mb-2" />
                          <span className="animate-pulse">AI 正在繪製完成圖...</span>
                        </div>
                      ) : selectedRecipe.imageUrl ? (
                        <img src={selectedRecipe.imageUrl} className="w-full h-full object-cover" alt="Dish result" />
                      ) : (
                         <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                            <Camera className="w-12 h-12 text-slate-600" />
                         </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-8">
                         <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">{selectedRecipe.name}</h1>
                         <div className="flex gap-2">
                            <span className="px-3 py-1 bg-emerald-500 text-slate-900 font-bold rounded-full text-sm">{selectedRecipe.cuisine}</span>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded-full text-sm">難度 {selectedRecipe.difficulty}/5</span>
                         </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-lg leading-relaxed mb-6">{selectedRecipe.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-8">
                      <div className="bg-slate-900/50 px-6 py-3 rounded-xl flex items-center border border-slate-700">
                        <Timer className="w-5 h-5 text-emerald-400 mr-2" />
                        <div>
                          <span className="block text-slate-500 text-[10px] uppercase tracking-widest">TOTAL TIME</span>
                          <span className="text-xl font-bold text-white">{selectedRecipe.totalTimeMinutes} <span className="text-sm font-normal">min</span></span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCookingMode(true)}
                        className="ml-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                      >
                        <ChefHat className="w-6 h-6 mr-2" />
                        開始烹飪模式
                      </button>
                    </div>

                    {/* Sauce Section - Highlighted */}
                    {selectedRecipe.sauce && (
                      <div className="mb-8 bg-orange-900/20 border border-orange-500/30 rounded-2xl p-6">
                        <h3 className="text-orange-400 font-bold text-xl mb-4 flex items-center">
                          <Droplets className="w-5 h-5 mr-2" />
                          靈魂醬汁 (Sauce) - {selectedRecipe.sauce.name}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2">配方比例</h4>
                            <ul className="space-y-2">
                              {selectedRecipe.sauce.ingredients.map((ing, i) => (
                                <li key={i} className="flex justify-between border-b border-orange-500/10 pb-1">
                                  <span className="text-slate-200">{ing.name}</span>
                                  <span className="text-orange-300 font-mono">{ing.amount}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2">調製秘訣</h4>
                            <p className="text-slate-200 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                              {selectedRecipe.sauce.mixInstruction}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <h3 className="text-white font-bold mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                      3D 食材透視 (Ingredients)
                    </h3>
                    <div className="bg-slate-900/80 rounded-2xl p-6 min-h-[250px] flex flex-wrap items-center justify-center relative overflow-hidden border border-slate-700/50 shadow-inner">
                       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900 -z-10"></div>
                       {selectedRecipe.ingredients.map((ing, i) => (
                         <IngredientCube key={i} ingredient={ing} delay={i * 0.5} />
                       ))}
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
                    <h3 className="text-white font-bold mb-6">烹飪流程預覽</h3>
                    <div className="space-y-6">
                      {selectedRecipe.steps.map((step, i) => (
                        <div key={i} className="flex items-start group">
                          <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold mr-4 shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors">
                            {step.stepNumber}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-slate-100 text-lg mb-2 font-medium">{step.instruction}</p>
                            <div className="flex flex-wrap gap-2 items-center">
                               {step.heatLevel && (
                                 <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 flex items-center">
                                   <Flame className="w-3 h-3 mr-1" />{step.heatLevel}
                                 </span>
                               )}
                               <p className="text-sm text-emerald-400 flex items-center bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/30">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {step.successTip}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Right Col: Matrix & Meta */}
               <div className="space-y-8">
                 <TasteMatrix profile={selectedRecipe.tasteProfile} />
                 
                 <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-slate-300 font-bold mb-4 text-sm tracking-widest">COOKING METHODS</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.cookingMethods.map(m => (
                        <span key={m} className="px-3 py-1 bg-slate-700 text-white text-sm rounded-lg border border-slate-600">
                          {m}
                        </span>
                      ))}
                    </div>
                 </div>

                 <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 rounded-2xl p-6 border border-emerald-500/20">
                    <h3 className="text-emerald-400 font-bold mb-2">新手防錯機制</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      本食譜已啟用智慧溫控引導。在進入烹飪模式後，系統將自動倒數計時並提示關鍵火侯轉換點，請務必開啟聲音。
                    </p>
                 </div>
               </div>

             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;