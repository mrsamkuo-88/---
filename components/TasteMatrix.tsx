import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TasteProfile } from '../types';

interface TasteMatrixProps {
  profile: TasteProfile;
}

const TasteMatrix: React.FC<TasteMatrixProps> = ({ profile }) => {
  const data = [
    { subject: '鹹', A: profile.salty, fullMark: 5 },
    { subject: '酸', A: profile.acidic, fullMark: 5 },
    { subject: '甜', A: profile.sweet, fullMark: 5 },
    { subject: '辣', A: profile.spicy, fullMark: 5 },
    { subject: '苦', A: profile.bitter, fullMark: 5 },
  ];

  return (
    <div className="w-full h-64 bg-slate-800/50 rounded-xl p-2 border border-slate-700">
      <h3 className="text-center text-slate-300 text-sm mb-2 font-mono tracking-widest">FLAVOR MATRIX</h3>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Taste"
            dataKey="A"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasteMatrix;