/**
 * App.tsx - 改良版（最小限必須項目：8項目）
 * 
 * 1000人シミュレーション + 4象限分析に必要な最小限：
 * 
 * 【第1セクション：商品基本】
 * 1. 商品名 ★
 * 2. カテゴリー ★（ドロップダウン）
 * 3. 価格帯 ★（ボタン選択：低/中/高）
 * 
 * 【第2セクション：ターゲット】
 * 4. ターゲット年齢層 ★（スライダー範囲：20-70）
 * 5. ターゲット年収層 ★（ドロップダウン）
 * 6. 販売チャネル ★（ボタン選択：オンライン/実店舗/両方）
 * 
 * 【第3セクション：製品・価値】
 * 7. 製品の主な特徴 ★（テキストエリア）
 * 8. 提供する価値・ソリューション（オプション：テキストエリア）
 */

import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, RefreshCw, Sparkles, ChevronRight } from "lucide-react";
import { ProductInfo, SliderParameters, SimulationResult } from "./types";
import { runSimulation } from "./simulationEngine";

// ============================================================================
// App コンポーネント
// ============================================================================

const App: React.FC = () => {
  const [step, setStep] = useState<"input" | "analysis">("input");
  
  // 商品データ
  const [productData, setProductData] = useState<ProductInfo>({
    productName: "",
    category: "",
    releaseDate: "",
    price: 50000,
    salesChannels: "",
    targetAgeMin: 20,
    targetAgeMax: 60,
    features: { appearance: "", function: "", concept: "" },
    customerHypothesis: "",
    valueProposition: { assumedNeeds: "", solutionHypothesis: "" },
  });

  // シミュレーションパラメータ
  const [sliderParams, setSliderParams] = useState<SliderParameters>({
    priceAdjustment: 0,
    salesLocationExpansion: 50,
    targetAgeRange: [20, 60],
    incomeTargetLevel: 50,
    regionDiversity: 50,
  });

  // シミュレーション結果
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // UI状態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========== バリデーション関数 ==========

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!productData.productName.trim()) {
      newErrors.productName = "商品名は必須です";
    }
    if (!productData.category) {
      newErrors.category = "カテゴリーは必須です";
    }
    if (productData.price === 0) {
      newErrors.price = "価格帯は必須です";
    }
    if (!productData.salesChannels) {
      newErrors.salesChannels = "販売チャネルは必須です";
    }
    if (!productData.features.function.trim()) {
      newErrors.features = "製品の主な特徴は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== フォーム送信 ==========

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("すべての必須項目を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedSliderParams: SliderParameters = {
        ...sliderParams,
        targetAgeRange: [productData.targetAgeMin, productData.targetAgeMax],
      };

      const result = runSimulation(productData, updatedSliderParams, 1000);
      setSimulationResult(result);
      setSliderParams(updatedSliderParams);
      setStep("analysis");
    } catch (err) {
      setError("シミュレーション実行中にエラーが発生しました。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========== 再シミュレーション ==========

  const handleReSimulate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = runSimulation(productData, sliderParams, 1000);
      setSimulationResult(result);
    } catch (err) {
      setError("再シミュレーション中にエラーが発生しました。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========== 入力画面 ==========

  if (step === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">✨</span>
              <h1 className="text-5xl font-bold text-slate-800">Persona Genie Pro v2</h1>
            </div>
            <p className="text-lg text-slate-600">8つの質問で1000人シミュレーション開始</p>
          </div>

          {/* フォーム */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* ===== 第1セクション：商品基本 ===== */}
            <div className="space-y-5 pb-8 border-b-2 border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📦</span> 商品の基本情報
              </h2>

              {/* 商品名 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  1️⃣ 商品名 <span className="text-red-500">★必須</span>
                </label>
                <input
                  type="text"
                  placeholder="例：スマートプロジェクター"
                  value={productData.productName}
                  onChange={(e) => {
                    setProductData({ ...productData, productName: e.target.value });
                    setErrors({ ...errors, productName: "" });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                    errors.productName ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.productName && (
                  <p className="text-red-600 text-sm mt-1">{errors.productName}</p>
                )}
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  2️⃣ カテゴリー <span className="text-red-500">★必須</span>
                </label>
                <select
                  value={productData.category}
                  onChange={(e) => {
                    setProductData({ ...productData, category: e.target.value });
                    setErrors({ ...errors, category: "" });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white ${
                    errors.category ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`}
                >
                  <option value="">-- 選択してください --</option>
                  <option value="電子機器">電子機器（AV機器、PC周辺機器など）</option>
                  <option value="生活家電">生活家電（冷蔵庫、洗濯機など）</option>
                  <option value="スマートホーム">スマートホーム（照明、スピーカーなど）</option>
                  <option value="美容健康">美容健康（スキンケア、サプリメントなど）</option>
                  <option value="食品飲料">食品飲料（お菓子、飲料など）</option>
                  <option value="ファッション">ファッション（衣料、アクセサリーなど）</option>
                  <option value="その他">その他</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* 価格帯 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  3️⃣ 価格帯 <span className="text-red-500">★必須</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "¥1K～5K", value: 3000 },
                    { label: "¥5K～50K", value: 25000 },
                    { label: "¥50K～", value: 100000 },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setProductData({ ...productData, price: value });
                        setErrors({ ...errors, price: "" });
                      }}
                      className={`py-3 rounded-lg font-bold transition border-2 ${
                        productData.price === value
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.price && (
                  <p className="text-red-600 text-sm mt-2">{errors.price}</p>
                )}
              </div>
            </div>

            {/* ===== 第2セクション：ターゲット ===== */}
            <div className="space-y-5 pb-8 border-b-2 border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">👥</span> ターゲット層の設定
              </h2>

              {/* ターゲット年齢層 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  4️⃣ ターゲット年齢層 <span className="text-red-500">★必須</span>
                </label>
                <div className="bg-indigo-50 p-4 rounded-lg space-y-4 border border-indigo-200">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-700">最小年齢</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {productData.targetAgeMin}歳
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="70"
                      value={productData.targetAgeMin}
                      onChange={(e) => {
                        const val = Math.min(parseInt(e.target.value), productData.targetAgeMax);
                        setProductData({ ...productData, targetAgeMin: val });
                      }}
                      className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-700">最大年齢</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {productData.targetAgeMax}歳
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="70"
                      value={productData.targetAgeMax}
                      onChange={(e) => {
                        const val = Math.max(parseInt(e.target.value), productData.targetAgeMin);
                        setProductData({ ...productData, targetAgeMax: val });
                      }}
                      className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <p className="text-sm font-bold text-indigo-700 text-center">
                    対象: {productData.targetAgeMin}～{productData.targetAgeMax}歳
                  </p>
                </div>
              </div>

              {/* ターゲット年収層 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  5️⃣ ターゲット年収層 <span className="text-red-500">★必須</span>
                </label>
                <select
                  value={
                    productData.valueProposition.assumedNeeds ||
                    "中所得層"
                  }
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      valueProposition: {
                        ...productData.valueProposition,
                        assumedNeeds: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                >
                  <option value="">-- 選択してください --</option>
                  <option value="低所得層">低所得層（年収200～400万円）</option>
                  <option value="中所得層">中所得層（年収400～700万円）</option>
                  <option value="高所得層">高所得層（年収700～1000万円）</option>
                  <option value="超高所得層">超高所得層（年収1000万円以上）</option>
                  <option value="幅広い層">幅広い層（全所得層対象）</option>
                </select>
              </div>

              {/* 販売チャネル */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  6️⃣ 販売チャネル <span className="text-red-500">★必須</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "オンライン", value: "オンライン" },
                    { label: "実店舗", value: "実店舗" },
                    { label: "両方", value: "両方" },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setProductData({ ...productData, salesChannels: value });
                        setErrors({ ...errors, salesChannels: "" });
                      }}
                      className={`py-3 rounded-lg font-bold transition border-2 ${
                        productData.salesChannels === value
                          ? "bg-green-600 text-white border-green-600 shadow-lg"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.salesChannels && (
                  <p className="text-red-600 text-sm mt-2">{errors.salesChannels}</p>
                )}
              </div>
            </div>

            {/* ===== 第3セクション：製品・価値 ===== */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">💡</span> 製品と提供価値
              </h2>

              {/* 製品の主な特徴 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  7️⃣ 製品の主な特徴 <span className="text-red-500">★必須</span>
                </label>
                <textarea
                  placeholder="例：4K映像対応、自動焦点調整、スマートホーム連携、バッテリー8時間、軽量設計"
                  value={productData.features.function}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      features: { ...productData.features, function: e.target.value },
                    });
                    setErrors({ ...errors, features: "" });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none h-20 ${
                    errors.features ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  複数ある場合はカンマで区切ってください
                </p>
                {errors.features && (
                  <p className="text-red-600 text-sm mt-1">{errors.features}</p>
                )}
              </div>

              {/* 提供する価値 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  8️⃣ 提供する価値・ソリューション（オプション）
                </label>
                <textarea
                  placeholder="例：時間短縮、生活の質向上、エンターテイメント充実、ストレス軽減"
                  value={productData.valueProposition.solutionHypothesis}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      valueProposition: {
                        ...productData.valueProposition,
                        solutionHypothesis: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none h-20"
                />
              </div>
            </div>

            {/* ===== 情報パネル ===== */}
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-lg">
              <p className="text-sm text-indigo-900 font-bold mb-2">
                ℹ️ これで何ができるのか？
              </p>
              <ul className="text-xs text-indigo-800 space-y-1 ml-4">
                <li>✅ 1000人の統計シミュレーション人口を自動生成</li>
                <li>✅ 認知度 × 購買意欲の4象限分析</li>
                <li>✅ インタラクティブなパラメータ調整機能</li>
                <li>✅ 象限別の詳細分析</li>
              </ul>
            </div>

            {/* ===== 送信ボタン ===== */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  シミュレーション実行中...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  1000人シミュレーション開始
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 分析画面 ==========

  if (step === "analysis" && simulationResult) {
    const quadrantCounts = simulationResult.statistics.quadrantDistribution;
    const plotData = simulationResult.persons.map((p) => ({
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
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">
              📊 4象限分析 × 1000人シミュレーション
            </h1>
            <p className="text-slate-600">
              <strong>{productData.productName}</strong> ({productData.category}) |
              ターゲット: {productData.targetAgeMin}～{productData.targetAgeMax}歳 |
              {productData.salesChannels}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* 2列レイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 左ペイン（40%）：パラメータスライダー */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 h-fit sticky top-4">
              <h2 className="text-lg font-bold text-slate-800 mb-6">⚙️ パラメータ調整</h2>

              <div className="space-y-6">
                {/* ターゲット年齢 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    👤 ターゲット年齢
                  </label>
                  <p className="text-2xl font-bold text-indigo-600 mb-3">
                    {sliderParams.targetAgeRange[0]}～
                    {sliderParams.targetAgeRange[1]}歳
                  </p>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    value={sliderParams.targetAgeRange[0]}
                    onChange={(e) => {
                      const val = Math.min(
                        parseInt(e.target.value),
                        sliderParams.targetAgeRange[1]
                      );
                      setSliderParams({
                        ...sliderParams,
                        targetAgeRange: [val, sliderParams.targetAgeRange[1]],
                      });
                    }}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="range"
                    min="20"
                    max="70"
                    value={sliderParams.targetAgeRange[1]}
                    onChange={(e) => {
                      const val = Math.max(
                        parseInt(e.target.value),
                        sliderParams.targetAgeRange[0]
                      );
                      setSliderParams({
                        ...sliderParams,
                        targetAgeRange: [sliderParams.targetAgeRange[0], val],
                      });
                    }}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                  />
                </div>

                {/* 価格調整 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    💰 価格調整
                  </label>
                  <p className="text-2xl font-bold text-red-600 mb-3">
                    {sliderParams.priceAdjustment > 0 ? "+" : ""}
                    {sliderParams.priceAdjustment}%
                  </p>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={sliderParams.priceAdjustment}
                    onChange={(e) =>
                      setSliderParams({
                        ...sliderParams,
                        priceAdjustment: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 販売チャネル拡大 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    🏪 販売チャネル拡大
                  </label>
                  <p className="text-2xl font-bold text-green-600 mb-3">
                    {sliderParams.salesLocationExpansion}%
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderParams.salesLocationExpansion}
                    onChange={(e) =>
                      setSliderParams({
                        ...sliderParams,
                        salesLocationExpansion: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 所得水準 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    💵 所得水準
                  </label>
                  <p className="text-2xl font-bold text-yellow-600 mb-3">
                    レベル {Math.ceil(sliderParams.incomeTargetLevel / 20)} / 5
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sliderParams.incomeTargetLevel}
                    onChange={(e) =>
                      setSliderParams({
                        ...sliderParams,
                        incomeTargetLevel: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 地域多様性 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    🗺️ 地域多様性
                  </label>
                  <p className="text-2xl font-bold text-purple-600 mb-3">
                    {sliderParams.regionDiversity}%
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sliderParams.regionDiversity}
                    onChange={(e) =>
                      setSliderParams({
                        ...sliderParams,
                        regionDiversity: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 再シミュレーションボタン */}
                <button
                  onClick={handleReSimulate}
                  disabled={loading}
                  className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  {loading ? "実行中..." : "再シミュレーション"}
                </button>
              </div>
            </div>

            {/* 右ペイン（60%）：分析結果 */}
            <div className="lg:col-span-3 space-y-8">
              {/* 象限別人数 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">📊 象限分布</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded border-2 border-red-200">
                    <p className="font-bold text-red-700">🔴 Q1（高認知×高欲望）</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {quadrantCounts.Q1}人
                    </p>
                    <p className="text-xs text-red-600 mt-1">優先度：最高</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-200">
                    <p className="font-bold text-yellow-700">🟡 Q2（低認知×高欲望）</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                      {quadrantCounts.Q2}人
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">マーケ必須</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
                    <p className="font-bold text-blue-700">🔵 Q3（低認知×低欲望）</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {quadrantCounts.Q3}人
                    </p>
                    <p className="text-xs text-blue-700 mt-1">開拓層</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded border-2 border-green-200">
                    <p className="font-bold text-green-700">🟢 Q4（高認知×低欲望）</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {quadrantCounts.Q4}人
                    </p>
                    <p className="text-xs text-green-700 mt-1">見直し層</p>
                  </div>
                </div>
              </div>

              {/* スキャッタープロット */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  認知度 × 購買意欲
                </h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                    >
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
                        label={{
                          value: "← 購買意欲",
                          angle: -90,
                          position: "insideLeft",
                        }}
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
                          fillOpacity={0.6}
                          isAnimationActive={false}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 戻るボタン */}
          <button
            onClick={() => setStep("input")}
            className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            ← 新しい商品を分析する
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
