import React from "react";
import type { PsychologicalTrigger } from "../../../types";

interface TriggersDisplayProps {
  triggers: PsychologicalTrigger[];
}

const TriggersDisplay: React.FC<TriggersDisplayProps> = ({ triggers }) => (
  <div className="space-y-2">
    {triggers.map((t, i) => (
      <div key={t.トリガー + i} className={`${i % 2 === 0 ? "bg-slate-50" : "bg-indigo-50"} rounded-lg p-4 border border-slate-200`}>
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">⚡</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-slate-800">{t.トリガー}</p>
            <p className="text-xs text-slate-600 mt-1">{t.発生場面}</p>
            <p className="text-xs text-indigo-600 mt-1 font-medium">{t["心理的変化"]}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default TriggersDisplay;
