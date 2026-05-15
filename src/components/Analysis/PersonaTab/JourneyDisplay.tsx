import React from "react";
import type { JourneyStage } from "../../../types";

interface JourneyDisplayProps {
  journey: {
    認知段階: JourneyStage;
    検討段階: JourneyStage;
    決定段階: JourneyStage;
    購入段階: JourneyStage;
  };
}

const STAGES = [
  { key: "認知段階" as const, num: 1, color: "bg-blue-500", light: "bg-blue-50 border-blue-200" },
  { key: "検討段階" as const, num: 2, color: "bg-indigo-500", light: "bg-indigo-50 border-indigo-200" },
  { key: "決定段階" as const, num: 3, color: "bg-purple-500", light: "bg-purple-50 border-purple-200" },
  { key: "購入段階" as const, num: 4, color: "bg-pink-500", light: "bg-pink-50 border-pink-200" },
];

const JourneyDisplay: React.FC<JourneyDisplayProps> = ({ journey }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
    {STAGES.map((s) => {
      const stage = journey[s.key];
      return (
        <div key={s.key} className="relative">
          {/* コネクター */}
          {s.num < 4 && (
            <div className="hidden md:block absolute top-5 -right-2 w-4 h-0.5 bg-slate-300 z-10" />
          )}
          {/* ドット */}
          <div className="flex justify-center mb-2">
            <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
              {s.num}
            </div>
          </div>
          {/* カード */}
          <div className={`${s.light} border rounded-lg p-3 text-xs space-y-1`}>
            <p className="font-bold text-slate-800">{stage.段階}</p>
            <p><span className="text-slate-500">状況:</span> {stage.状況}</p>
            <p><span className="text-slate-500">心理:</span> {stage.心理状態}</p>
            <p><span className="text-slate-500">行動:</span> {stage.行動}</p>
            <p><span className="text-slate-500">接点:</span> {stage.タッチポイント}</p>
          </div>
        </div>
      );
    })}
  </div>
);

export default JourneyDisplay;
