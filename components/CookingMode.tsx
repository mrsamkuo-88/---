import React, { useState, useEffect } from 'react';
import { Recipe, CookingStep } from '../types';
import { Play, Check, Flame, Clock, ChevronRight, ChevronLeft, RotateCcw, X } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const step: CookingStep = recipe.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / recipe.steps.length) * 100;

  useEffect(() => {
    setTimeLeft(step.durationSeconds || 0);
    setTimerActive(false);
  }, [currentStepIndex, step.durationSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleNext = () => {
    if (currentStepIndex < recipe.steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full">
            <X className="w-6 h-6 text-slate-400" />
          </button>
          <div className="flex flex-col">
             <span className="text-emerald-400 font-bold text-lg">{recipe.name}</span>
             <span className="text-slate-400 text-xs tracking-wider">STEP {currentStepIndex + 1} / {recipe.steps.length}</span>
          </div>
        </div>
        <div className="w-1/3 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Background Visual Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row gap-12 items-center">
            
          {/* Step Instruction Card */}
          <div className="flex-1 space-y-8">
             <div className="flex items-center space-x-3 text-emerald-400 mb-4">
                {step.heatLevel && (
                  <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1
                    ${step.heatLevel === '大火' ? 'bg-red-500/20 text-red-400' : 
                      step.heatLevel === '中火' ? 'bg-orange-500/20 text-orange-400' :
                      step.heatLevel === '小火' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                    <Flame className="w-4 h-4" />
                    <span>{step.heatLevel}</span>
                  </div>
                )}
             </div>

             <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                {step.instruction}
             </h2>

             <div className="bg-slate-800/50 border-l-4 border-emerald-500 p-6 rounded-r-xl backdrop-blur-sm">
                <h4 className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-widest">Success Tip</h4>
                <p className="text-emerald-100 text-lg flex items-start">
                   <Check className="w-6 h-6 mr-3 text-emerald-400 shrink-0" />
                   {step.successTip}
                </p>
             </div>
          </div>

          {/* Timer & Controls */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
             {step.durationSeconds ? (
               <div className="w-64 h-64 rounded-full border-4 border-slate-700 flex flex-col items-center justify-center relative mb-8 bg-slate-800/30">
                  <span className="text-6xl font-mono font-bold text-white tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                  <div className="absolute bottom-10 flex space-x-4">
                     <button 
                       onClick={() => setTimerActive(!timerActive)}
                       className="p-4 bg-emerald-500 hover:bg-emerald-600 rounded-full text-slate-900 transition-colors"
                     >
                       <Play className={`w-6 h-6 ${timerActive ? 'fill-current' : ''}`} />
                     </button>
                     <button 
                       onClick={() => { setTimeLeft(step.durationSeconds || 0); setTimerActive(false); }}
                       className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
                     >
                       <RotateCcw className="w-6 h-6" />
                     </button>
                  </div>
               </div>
             ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-600">
                   <Clock className="w-24 h-24 opacity-20" />
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="h-24 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-8 md:px-24">
         <button 
           onClick={handlePrev}
           disabled={currentStepIndex === 0}
           className="flex items-center space-x-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
         >
           <ChevronLeft className="w-6 h-6" />
           <span className="text-lg font-medium">上一歩</span>
         </button>

         <button 
           onClick={currentStepIndex === recipe.steps.length - 1 ? onClose : handleNext}
           className="flex items-center space-x-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-8 py-3 rounded-full font-bold text-lg transition-transform active:scale-95"
         >
           <span>{currentStepIndex === recipe.steps.length - 1 ? '完成料理' : '下一步'}</span>
           <ChevronRight className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

export default CookingMode;