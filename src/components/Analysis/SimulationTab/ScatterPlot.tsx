import React, { useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { SimulatedPerson } from "../../../types";

interface ScatterPlotProps {
  persons: SimulatedPerson[];
  maxPoints?: number;
}

const QUADRANT_COLORS: Record<string, string> = {
  Q1: "#EF4444", Q2: "#FBBF24", Q3: "#3B82F6", Q4: "#10B981",
};

const ScatterPlot: React.FC<ScatterPlotProps> = ({ persons, maxPoints = 2000 }) => {
  const sampled = useMemo(() => {
    if (persons.length <= maxPoints) return persons;
    const shuffled = [...persons].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxPoints);
  }, [persons, maxPoints]);

  const plotData = useMemo(
    () => sampled.map((p) => ({ awareness: p.awarenessScore, desire: p.purchaseIntentScore, quadrant: p.quadrant })),
    [sampled]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-2">認知度 × 購買意欲</h2>
      {persons.length > maxPoints && (
        <p className="text-xs text-slate-500 mb-4">
          {persons.length.toLocaleString()}人中 {maxPoints.toLocaleString()}人をサンプリング表示
        </p>
      )}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis type="number" dataKey="awareness" name="認知度" label={{ value: "認知度 →", position: "insideBottomRight", offset: -10 }} domain={[0, 100]} />
            <YAxis type="number" dataKey="desire" name="購買意欲" label={{ value: "← 購買意欲", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
              <Scatter key={q} name={q} data={plotData.filter((p) => p.quadrant === q)} fill={QUADRANT_COLORS[q]} fillOpacity={0.6} isAnimationActive={false} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScatterPlot;
