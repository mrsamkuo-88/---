import React from 'react';
import { Ingredient3D } from '../types';

interface IngredientCubeProps {
  ingredient: Ingredient3D;
  delay: number;
}

const IngredientCube: React.FC<IngredientCubeProps> = ({ ingredient, delay }) => {
  return (
    <div 
      className="group relative w-24 h-24 perspective-1000 m-4 cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative w-full h-full transform-style-3d transition-transform duration-700 ease-out group-hover:rotate-x-12 group-hover:rotate-y-12 animate-float">
        {/* Front */}
        <div 
          className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center border border-white/20 shadow-lg"
          style={{ 
            backgroundColor: ingredient.colorHex, 
            transform: 'translateZ(48px)',
            opacity: 0.95
          }}
        >
          <span className="text-white font-bold text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center px-1">
            {ingredient.name}
          </span>
          <span className="text-white/90 text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-medium">
            {ingredient.amount}
          </span>
        </div>
        
        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden flex items-center justify-center border border-white/20"
          style={{ 
            backgroundColor: ingredient.colorHex, 
            transform: 'rotateY(180deg) translateZ(48px)',
            filter: 'brightness(0.7)'
          }}
        >
          <span className="text-white text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{ingredient.shape}</span>
        </div>

        {/* Right */}
        <div 
          className="absolute w-full h-full backface-hidden border border-white/20"
          style={{ 
            backgroundColor: ingredient.colorHex, 
            transform: 'rotateY(90deg) translateZ(48px)',
            filter: 'brightness(0.8)'
          }}
        />

        {/* Left */}
        <div 
          className="absolute w-full h-full backface-hidden border border-white/20"
          style={{ 
            backgroundColor: ingredient.colorHex, 
            transform: 'rotateY(-90deg) translateZ(48px)',
            filter: 'brightness(0.8)'
          }}
        />

        {/* Top */}
        <div 
          className="absolute w-full h-full backface-hidden flex items-center justify-center border border-white/20"
          style={{ 
            backgroundColor: ingredient.colorHex, 
            transform: 'rotateX(90deg) translateZ(48px)',
            filter: 'brightness(1.1)'
          }}
        >
           <span className="text-white/80 text-[10px] transform rotate-180 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{ingredient.texture}</span>
        </div>

        {/* Bottom */}
        <div 
          className="absolute w-full h-full backface-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ 
            backgroundColor: ingredient.colorHex, 
            transform: 'rotateX(-90deg) translateZ(48px)',
            filter: 'brightness(0.5)'
          }}
        />
      </div>
    </div>
  );
};

export default IngredientCube;