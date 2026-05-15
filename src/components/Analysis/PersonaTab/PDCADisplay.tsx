import React from "react";

interface PDCADisplayProps {
  pdca: { Plan: string; Do: string; Check: string; Action: string };
}

const ITEMS = [
  { key: "Plan" as const, label: "Plan / 計画", icon: "📋", bg: "bg-blue-50 border-blue-200 text-blue-800" },
  { key: "Do" as const, label: "Do / 実行", icon: "🚀", bg: "bg-green-50 border-green-200 text-green-800" },
  { key: "Check" as const, label: "Check / 評価", icon: "📊", bg: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { key: "Action" as const, label: "Action / 改善", icon: "🔧", bg: "bg-red-50 border-red-200 text-red-800" },
];

const PDCADisplay: React.FC<PDCADisplayProps> = ({ pdca }) => (
  <div className="grid grid-cols-2 gap-3">
    {ITEMS.map((item) => (
      <div key={item.key} className={`${item.bg} border rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{item.icon}</span>
          <span className="font-bold text-sm">{item.label}</span>
        </div>
        <p className="text-xs">{pdca[item.key]}</p>
      </div>
    ))}
  </div>
);

export default PDCADisplay;
