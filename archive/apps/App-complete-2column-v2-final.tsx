/**
 * App.tsx - v2 完全版 2列レイアウト
 * 
 * 左ペイン（40%）：5つのスライダー + 再シミュレーション
 * 右ペイン（60%）：4象限分析 + スキャッタープロット + ペルソナ生成
 */

import React, { useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { AlertCircle, RefreshCw, Zap } from "lucide-react";
import { ProductInfo, SliderParameters, SimulatedPerson, SimulationResult, PersonaDetails } from "./types";
import { runSimulation } from "./simulationEngine";

// ============================================================================
// 型定義
// ============================================================================

interface AppState {
  step: "input" | "analysis" | "personas";
  productData: ProductInfo;
  sliderParams: SliderParameters;
  simulationResult: SimulationResult | null;
  personas: { A: PersonaDetails | null; B: PersonaDetails | null; C: PersonaDetails | null };
  loading: boolean;
  error: string | null;
}

// ============================================================================
// App コンポーネント
// ============================================================================

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: "input",
    productData: {
      productName: "",
      category: "",
      releaseDate: "",
      price: 0,
      salesChannels: "",
      targetAgeMin: 20,
      targetAgeMax: 60,
      features: { appearance: "", function: "", concept: "" },
      customerHypothesis: "",
      valueProposition: { assumedNeeds: "", solutionHypothesis: "" },
    },
    sliderParams: {
      priceAdjustment: 0,
      salesLocationExpansion: 50,
      targetAgeRange: [20, 60],
      incomeTargetLevel: 50,
      regionDiversity: 50,
    },
    simulationResult: null,
    personas: { A: null, B: null, C: null },
    loading: false,
    error: null,
  });

  const [activePersona, setActivePersona] = useState<"A" | "B" | "C">("A");

  // ========== ハンドラー関数 ==========

  const handleProductDataChange = (field: keyof ProductInfo, value: any) => {
    setState((prev) => ({ ...prev, productData: { ...prev.productData, [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!state.productData.productName || !state.productData.category) {
      setState((prev) => ({ ...prev, error: "商品名とカテゴリーを入力してください。" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const simulation = runSimulation(state.productData, state.sliderParams, 1000);
      setState((prev) => ({ ...prev, simulationResult: simulation, step: "analysis", loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "シミュレーション実行中にエラーが発生しました。",
        loading: false,
      }));
      console.error(err);
    }
  };

  const handleSliderChange = (key: keyof SliderParameters, value: number | [number, number]) => {
    setState((prev) => ({ ...prev, sliderParams: { ...prev.sliderParams, [key]: value } }));
  };

  const handleReSimulate = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const simulation = runSimulation(state.productData, state.sliderParams, 1000);
      setState((prev) => ({ ...prev, simulationResult: simulation, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "再シミュレーション中にエラーが発生しました。",
        loading: false,
      }));
      console.error(err);
    }
  };

  const handleGeneratePersonas = () => {
    // モックペルソナ生成（API呼び出しの代わり）
    setState((prev) => ({ ...prev, step: "personas" }));
  };

  // ========== 入力画面 ==========

  const InputScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 text-center mb-8">
          ✨ Persona Genie Pro v2
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">商品情報を入力</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="商品名"
              value={state.productData.productName}
              onChange={(e) => handleProductDataChange("productName", e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="カテゴリー"
              value={state.productData.category}
              onChange={(e) => handleProductDataChange("category", e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {state.error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle size={20} />
              {state.error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={state.loading || !state.productData.productName || !state.productData.category}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {state.loading ? "実行中..." : "シミュレーション開始"}
          </button>
        </div>
      </div>
    </div>
  );

  // ========== 分析画面 ==========

  const AnalysisScreen = () => {
    if (!state.simulationResult) return null;

    const quadrantCounts = state.simulationResult.statistics.quadrantDistribution;

    const plotData = state.simulationResult.persons.map((p) => ({
      awareness: p.awarenessScore,
      desire: p.purchaseIntentScore,
      quadrant: p.quadrant,
    }));

    const quadrantColors: Record<string, string> = {
      Q1: "#EF4444",
      Q2: "#FBBF24",
      Q3: "#3B82F6",
      Q4: "#10B981",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ヘッダー */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">📊 4象限分析 × 1000人シミュレーション</h1>
            <p className="text-slate-600">
              {state.productData.productName} ({state.productData.category})
            </p>
          </div>

          {/* エラー表示 */}
          {state.error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle size={20} />
              {state.error}
            </div>
          )}

          {/* 2列レイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 左ペイン（40%）：パラメータ調整 */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 h-fit sticky top-4">
              <h2 className="text-xl font-bold text-slate-800 mb-6">⚙️ パラメータ調整</h2>

              <div className="space-y-6">
                {/* ターゲット年齢 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    👤 ターゲット年齢: {state.sliderParams.targetAgeRange[0]}歳
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    value={state.sliderParams.targetAgeRange[0]}
                    onChange={(e) =>
                      handleSliderChange("targetAgeRange", [
                        parseInt(e.target.value),
                        state.sliderParams.targetAgeRange[1],
                      ])
                    }
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>20歳</span>
                    <span>70歳</span>
                  </div>
                </div>

                {/* 価格調整 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    💰 価格調整: {state.sliderParams.priceAdjustment > 0 ? "+" : ""}
                    {state.sliderParams.priceAdjustment}%
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={state.sliderParams.priceAdjustment}
                    onChange={(e) => handleSliderChange("priceAdjustment", parseInt(e.target.value))}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                {/* 販売チャネル拡大 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    🏪 販売チャネル拡大: {state.sliderParams.salesLocationExpansion}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.sliderParams.salesLocationExpansion}
                    onChange={(e) =>
                      handleSliderChange("salesLocationExpansion", parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 所得水準 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    💵 所得水準: レベル {Math.ceil(state.sliderParams.incomeTargetLevel / 20)} (1-5)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={state.sliderParams.incomeTargetLevel}
                    onChange={(e) =>
                      handleSliderChange("incomeTargetLevel", parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>低</span>
                    <span>高</span>
                  </div>
                </div>

                {/* 地域多様性 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    🗺️ 地域多様性: {state.sliderParams.regionDiversity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.sliderParams.regionDiversity}
                    onChange={(e) => handleSliderChange("regionDiversity", parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>東京集中</span>
                    <span>全国均等</span>
                  </div>
                </div>

                {/* 再シミュレーションボタン */}
                <button
                  onClick={handleReSimulate}
                  disabled={state.loading}
                  className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  {state.loading ? "実行中..." : "再シミュレーション"}
                </button>
              </div>
            </div>

            {/* 右ペイン（60%）：4象限分析 */}
            <div className="lg:col-span-3 space-y-8">
              {/* 象限別人数 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">📊 象限分布</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="font-bold text-red-700">🔴 Q1（高認知×高欲望）</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{quadrantCounts.Q1}人</p>
                    <p className="text-xs text-red-500 mt-1">優先度：最高</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <p className="font-bold text-yellow-700">🟡 Q2（低認知×高欲望）</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{quadrantCounts.Q2}人</p>
                    <p className="text-xs text-yellow-600 mt-1">マーケ必須</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="font-bold text-blue-700">🔵 Q3（低認知×低欲望）</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{quadrantCounts.Q3}人</p>
                    <p className="text-xs text-blue-600 mt-1">開拓層</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="font-bold text-green-700">🟢 Q4（高認知×低欲望）</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{quadrantCounts.Q4}人</p>
                    <p className="text-xs text-green-600 mt-1">見直し層</p>
                  </div>
                </div>
              </div>

              {/* スキャッタープロット */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">認知度 × 購買意欲 分析</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                      <XAxis
                        type="number"
                        dataKey="awareness"
                        name="認知度"
                        label={{ value: "認知度 →", position: "insideBottomRight", offset: -10 }}
                        domain={[0, 100]}
                      />
                      <YAxis
                        type="number"
                        dataKey="desire"
                        name="購買意欲"
                        label={{ value: "← 購買意欲", angle: -90, position: "insideLeft" }}
                        domain={[0, 100]}
                      />
                      <Tooltip />
                      <Legend />

                      {["Q1", "Q2", "Q3", "Q4"].map((quadrant) => (
                        <Scatter
                          key={quadrant}
                          name={quadrant}
                          data={plotData.filter((p) => p.quadrant === quadrant)}
                          fill={quadrantColors[quadrant]}
                          fillOpacity={0.5}
                          isAnimationActive={false}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ペルソナ生成ボタン */}
              <button
                onClick={handleGeneratePersonas}
                disabled={state.loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                <Zap size={24} />
                3つのAI詳細ペルソナを生成
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== ペルソナ詳細画面 ==========

  const PersonasScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-slate-800">👤 生成されたペルソナ</h1>

        <div className="flex gap-3 mb-6">
          {(["A", "B", "C"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActivePersona(key)}
              className={`px-6 py-3 rounded-lg font-bold transition text-white ${
                activePersona === key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                  : "bg-slate-400 hover:bg-slate-500"
              }`}
            >
              ペルソナ{key}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-slate-600 text-center py-8">
            ペルソナの詳細情報はここに表示されます
          </p>
        </div>

        <button
          onClick={() => setState((prev) => ({ ...prev, step: "analysis" }))}
          className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition"
        >
          ← 分析画面に戻る
        </button>
      </div>
    </div>
  );

  // ========== レンダリング ==========

  return (
    <div>
      {state.step === "input" && <InputScreen />}
      {state.step === "analysis" && <AnalysisScreen />}
      {state.step === "personas" && <PersonasScreen />}
    </div>
  );
};

export default App;
