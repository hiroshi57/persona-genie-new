import React from "react";

interface QuadrantDisplayProps {
  quadrantCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
}

const QUADRANTS = [
  { key: "Q1" as const, label: "Q1（高認知×高欲望）", sub: "優先度：最高", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", count: "text-red-600", dot: "🔴" },
  { key: "Q2" as const, label: "Q2（低認知×高欲望）", sub: "マーケ必須", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", count: "text-yellow-600", dot: "🟡" },
  { key: "Q3" as const, label: "Q3（低認知×低欲望）", sub: "開拓層", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", count: "text-blue-600", dot: "🔵" },
  { key: "Q4" as const, label: "Q4（高認知×低欲望）", sub: "見直し層", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", count: "text-green-600", dot: "🟢" },
];

const QuadrantDisplay: React.FC<QuadrantDisplayProps> = ({ quadrantCounts }) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <h2 className="text-xl font-bold text-slate-800 mb-4">📊 象限分布</h2>
    <div className="grid grid-cols-2 gap-4">
      {QUADRANTS.map((q) => (
        <div key={q.key} className={`${q.bg} p-4 rounded border-2 ${q.border}`}>
          <p className={`font-bold ${q.text}`}>{q.dot} {q.label}</p>
          <p className={`text-3xl font-bold ${q.count} mt-2`}>{quadrantCounts[q.key].toLocaleString()}人</p>
          <p className={`text-xs ${q.text} mt-1`}>{q.sub}</p>
        </div>
      ))}
    </div>
  </div>
);

export default QuadrantDisplay;
