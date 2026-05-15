import React from "react";
import { RefreshCw } from "lucide-react";
import type { SliderParameters } from "../../../types";

interface ParameterPanelProps {
  sliderParams: SliderParameters;
  setSliderParams: (p: SliderParameters) => void;
  onReSimulate: () => void;
  loading: boolean;
}

const ParameterPanel: React.FC<ParameterPanelProps> = ({ sliderParams, setSliderParams, onReSimulate, loading }) => {
  const update = (patch: Partial<SliderParameters>) => setSliderParams({ ...sliderParams, ...patch });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6">⚙️ パラメータ調整</h2>
      <div className="space-y-5">
        {/* ターゲット年齢 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">👤 ターゲット年齢</label>
          <p className="text-xl font-bold text-indigo-600 mb-2">{sliderParams.targetAgeRange[0]}～{sliderParams.targetAgeRange[1]}歳</p>
          <input type="range" min="20" max="70" value={sliderParams.targetAgeRange[0]}
            onChange={(e) => { const v = Math.min(+e.target.value, sliderParams.targetAgeRange[1]); update({ targetAgeRange: [v, sliderParams.targetAgeRange[1]] }); }}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          <input type="range" min="20" max="70" value={sliderParams.targetAgeRange[1]}
            onChange={(e) => { const v = Math.max(+e.target.value, sliderParams.targetAgeRange[0]); update({ targetAgeRange: [sliderParams.targetAgeRange[0], v] }); }}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1" />
        </div>
        {/* 価格調整 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">💰 価格調整</label>
          <p className="text-xl font-bold text-red-600 mb-2">{sliderParams.priceAdjustment > 0 ? "+" : ""}{sliderParams.priceAdjustment}%</p>
          <input type="range" min="-50" max="50" value={sliderParams.priceAdjustment}
            onChange={(e) => update({ priceAdjustment: +e.target.value })}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
        {/* 販売チャネル拡大 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">🏪 販売チャネル拡大</label>
          <p className="text-xl font-bold text-green-600 mb-2">{sliderParams.salesLocationExpansion}%</p>
          <input type="range" min="0" max="100" value={sliderParams.salesLocationExpansion}
            onChange={(e) => update({ salesLocationExpansion: +e.target.value })}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
        {/* 所得水準 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">💵 所得水準</label>
          <p className="text-xl font-bold text-yellow-600 mb-2">レベル {Math.ceil(sliderParams.incomeTargetLevel / 20)} / 5</p>
          <input type="range" min="0" max="100" step="5" value={sliderParams.incomeTargetLevel}
            onChange={(e) => update({ incomeTargetLevel: +e.target.value })}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
        {/* 地域多様性 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">🗺️ 地域多様性</label>
          <p className="text-xl font-bold text-purple-600 mb-2">{sliderParams.regionDiversity}%</p>
          <input type="range" min="0" max="100" step="5" value={sliderParams.regionDiversity}
            onChange={(e) => update({ regionDiversity: +e.target.value })}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
        {/* 再シミュレーション */}
        <button onClick={onReSimulate} disabled={loading}
          className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
          <RefreshCw size={20} />
          {loading ? "実行中..." : "再シミュレーション"}
        </button>
      </div>
    </div>
  );
};

export default ParameterPanel;
