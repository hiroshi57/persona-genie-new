import React from "react";
import type { ScreeningFilters, FamilyType, PetOwnership, HousingType } from "../../../types";

interface ScreeningPanelProps {
  filters: ScreeningFilters;
  setFilters: (f: ScreeningFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const FAMILY_OPTIONS: FamilyType[] = ['単身', '夫婦のみ', '夫婦+子', 'ひとり親', '三世代同居'];
const PET_OPTIONS: PetOwnership[] = ['なし', '犬', '猫', '両方', 'その他'];
const HOUSING_OPTIONS: HousingType[] = ['賃貸', '持ち家(マンション)', '持ち家(戸建て)'];

function toggleArray<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

const ScreeningPanel: React.FC<ScreeningPanelProps> = ({ filters, setFilters, totalCount, filteredCount }) => {
  const update = (patch: Partial<ScreeningFilters>) => setFilters({ ...filters, ...patch });

  const clearAll = () => setFilters({
    ageRange: [18, 75], incomeRange: [0, 2000], familyTypes: [], petOwnerships: [],
    housingTypes: [], digitalLiteracyRange: [1, 5], quadrants: [], occupations: [], regions: [],
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">🔍 スクリーニング</h2>
      <div className="space-y-4">
        {/* 年齢レンジ */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">年齢: {filters.ageRange[0]}～{filters.ageRange[1]}歳</label>
          <div className="flex gap-2 items-center">
            <input type="range" min="18" max="75" value={filters.ageRange[0]}
              onChange={(e) => update({ ageRange: [Math.min(+e.target.value, filters.ageRange[1]), filters.ageRange[1]] })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <input type="range" min="18" max="75" value={filters.ageRange[1]}
              onChange={(e) => update({ ageRange: [filters.ageRange[0], Math.max(+e.target.value, filters.ageRange[0])] })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
        </div>
        {/* 年収レンジ */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">年収: {filters.incomeRange[0]}～{filters.incomeRange[1]}万円</label>
          <div className="flex gap-2 items-center">
            <input type="range" min="0" max="2000" step="50" value={filters.incomeRange[0]}
              onChange={(e) => update({ incomeRange: [Math.min(+e.target.value, filters.incomeRange[1]), filters.incomeRange[1]] })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <input type="range" min="0" max="2000" step="50" value={filters.incomeRange[1]}
              onChange={(e) => update({ incomeRange: [filters.incomeRange[0], Math.max(+e.target.value, filters.incomeRange[0])] })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
        </div>
        {/* 家族形態 */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">家族形態</label>
          <div className="flex flex-wrap gap-1">
            {FAMILY_OPTIONS.map((f) => (
              <button key={f} onClick={() => update({ familyTypes: toggleArray(filters.familyTypes, f) })}
                className={`px-2 py-1 text-xs rounded-full border transition ${filters.familyTypes.includes(f) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {/* ペット保有 */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">ペット保有</label>
          <div className="flex flex-wrap gap-1">
            {PET_OPTIONS.map((p) => (
              <button key={p} onClick={() => update({ petOwnerships: toggleArray(filters.petOwnerships, p) })}
                className={`px-2 py-1 text-xs rounded-full border transition ${filters.petOwnerships.includes(p) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {/* 住居形態 */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">住居形態</label>
          <div className="flex flex-wrap gap-1">
            {HOUSING_OPTIONS.map((h) => (
              <button key={h} onClick={() => update({ housingTypes: toggleArray(filters.housingTypes, h) })}
                className={`px-2 py-1 text-xs rounded-full border transition ${filters.housingTypes.includes(h) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}>
                {h}
              </button>
            ))}
          </div>
        </div>
        {/* デジタルリテラシー */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">デジタル利用度: {filters.digitalLiteracyRange[0]}～{filters.digitalLiteracyRange[1]}</label>
          <div className="flex gap-2">
            <input type="range" min="1" max="5" value={filters.digitalLiteracyRange[0]}
              onChange={(e) => update({ digitalLiteracyRange: [Math.min(+e.target.value, filters.digitalLiteracyRange[1]), filters.digitalLiteracyRange[1]] })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <input type="range" min="1" max="5" value={filters.digitalLiteracyRange[1]}
              onChange={(e) => update({ digitalLiteracyRange: [filters.digitalLiteracyRange[0], Math.max(+e.target.value, filters.digitalLiteracyRange[0])] })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
        </div>
        {/* 象限 */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">象限</label>
          <div className="flex gap-1">
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
              <button key={q} onClick={() => update({ quadrants: toggleArray(filters.quadrants, q) })}
                className={`px-3 py-1 text-xs rounded-full border transition ${filters.quadrants.includes(q) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
        {/* クリア + 結果 */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700 underline">フィルタをクリア</button>
          <p className="text-sm font-bold text-indigo-600">{filteredCount.toLocaleString()} / {totalCount.toLocaleString()} 人</p>
        </div>
      </div>
    </div>
  );
};

export default ScreeningPanel;
