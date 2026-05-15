import React from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { ComputedBig5 } from "../../../types";

interface Big5ChartProps {
  big5: ComputedBig5;
}

const Big5Chart: React.FC<Big5ChartProps> = ({ big5 }) => {
  const data = [
    { trait: "開放性", score: big5.openness, fullMark: 100 },
    { trait: "誠実性", score: big5.conscientiousness, fullMark: 100 },
    { trait: "外向性", score: big5.extraversion, fullMark: 100 },
    { trait: "協調性", score: big5.agreeableness, fullMark: 100 },
    { trait: "神経症傾向", score: big5.neuroticism, fullMark: 100 },
  ];

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: "#475569" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Radar name="BIG5" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 text-center mt-1">シミュレーションデータから算出</p>
    </div>
  );
};

export default Big5Chart;
