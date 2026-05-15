import React from "react";

interface AIDMADisplayProps {
  aidma: { 認知: string; 興味: string; 欲求: string; 記憶: string; 行動: string };
}

const STEPS = [
  { key: "認知" as const, letter: "A", label: "Attention", width: "100%", bg: "bg-blue-100 text-blue-800" },
  { key: "興味" as const, letter: "I", label: "Interest", width: "88%", bg: "bg-blue-200 text-blue-800" },
  { key: "欲求" as const, letter: "D", label: "Desire", width: "76%", bg: "bg-indigo-200 text-indigo-800" },
  { key: "記憶" as const, letter: "M", label: "Memory", width: "64%", bg: "bg-indigo-300 text-indigo-900" },
  { key: "行動" as const, letter: "A", label: "Action", width: "52%", bg: "bg-purple-300 text-purple-900" },
];

const AIDMADisplay: React.FC<AIDMADisplayProps> = ({ aidma }) => (
  <div className="space-y-2">
    {STEPS.map((s) => (
      <div key={s.label} className="flex justify-center">
        <div className={`${s.bg} rounded-lg px-4 py-3 transition-all`} style={{ width: s.width }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg">{s.letter}</span>
            <span className="text-xs font-bold opacity-70">{s.label} / {s.key}</span>
          </div>
          <p className="text-xs">{aidma[s.key]}</p>
        </div>
      </div>
    ))}
  </div>
);

export default AIDMADisplay;
