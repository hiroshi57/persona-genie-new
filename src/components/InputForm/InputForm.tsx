import React, { useState } from "react";
import { AlertCircle, Sparkles, ChevronRight, ChevronLeft, Package, Users, Lightbulb, Sliders } from "lucide-react";
import { ProductInfo, HousingType } from "../../types";
import { toFamilyType, toPetOwnership, toFinancialAssets } from "../../validation";

interface InputFormProps {
  productData: ProductInfo;
  setProductData: (data: ProductInfo) => void;
  onSubmit: () => void;
  loading: boolean;
  errors: Record<string, string>;
  error: string | null;
  progress?: number;
}

const STEPS = [
  { id: 0, label: "商品基本情報", icon: Package, desc: "商品名・カテゴリ・価格帯" },
  { id: 1, label: "ターゲット設定", icon: Users, desc: "年齢・収入・チャネル" },
  { id: 2, label: "製品・価値", icon: Lightbulb, desc: "特徴・ソリューション" },
  { id: 3, label: "詳細属性", icon: Sliders, desc: "家族・住居・趣味" },
];

const LAST_STEP = STEPS.length - 1;

const InputForm: React.FC<InputFormProps> = ({
  productData, setProductData, onSubmit, loading, errors, error, progress = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const update = <K extends keyof ProductInfo>(field: K, value: ProductInfo[K]) =>
    setProductData({ ...productData, [field]: value });

  const updateFeatures = (key: keyof ProductInfo["features"], value: string) =>
    setProductData({ ...productData, features: { ...productData.features, [key]: value } });

  const updateValueProp = (key: keyof ProductInfo["valueProposition"], value: string) =>
    setProductData({ ...productData, valueProposition: { ...productData.valueProposition, [key]: value } });

  const inputCls = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition text-sm bg-white ${
      errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-slate-200 focus:ring-violet-200 focus:border-violet-400"
    }`;

  const selectCls = `w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition text-sm`;

  const chipBtn = (active: boolean) =>
    `py-2.5 px-4 rounded-xl font-semibold text-sm transition border-2 ${
      active
        ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200"
        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700"
    }`;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                商品名 <span className="text-violet-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例：スマートプロジェクター X1"
                value={productData.productName}
                onChange={(e) => update("productName", e.target.value)}
                className={inputCls("productName")}
              />
              {errors.productName && <p className="text-red-500 text-xs mt-1.5">{errors.productName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                カテゴリー <span className="text-violet-500">*</span>
              </label>
              <select value={productData.category} onChange={(e) => update("category", e.target.value)} className={selectCls}>
                <option value="">選択してください</option>
                <option value="電子機器">電子機器</option>
                <option value="生活家電">生活家電</option>
                <option value="スマートホーム">スマートホーム</option>
                <option value="美容健康">美容・健康</option>
                <option value="食品飲料">食品・飲料</option>
                <option value="ファッション">ファッション</option>
                <option value="その他">その他</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                価格帯 <span className="text-violet-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "¥1K〜5K", sub: "低価格帯", value: 3000 },
                  { label: "¥5K〜50K", sub: "中価格帯", value: 25000 },
                  { label: "¥50K〜", sub: "高価格帯", value: 100000 },
                ].map(({ label, sub, value }) => (
                  <button
                    key={value} type="button"
                    onClick={() => update("price", value)}
                    className={`py-3.5 rounded-xl border-2 text-center transition ${
                      productData.price === value
                        ? "bg-violet-50 border-violet-500 shadow-md shadow-violet-100"
                        : "bg-white border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    <div className={`font-bold text-sm ${productData.price === value ? "text-violet-700" : "text-slate-700"}`}>{label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                ターゲット年齢層 <span className="text-violet-500">*</span>
              </label>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 space-y-5">
                {[
                  { label: "最小年齢", field: "targetAgeMin" as const, val: productData.targetAgeMin },
                  { label: "最大年齢", field: "targetAgeMax" as const, val: productData.targetAgeMax },
                ].map(({ label, field, val }) => (
                  <div key={field}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-slate-600 font-medium">{label}</span>
                      <span className="text-sm font-bold text-violet-700">{val}歳</span>
                    </div>
                    <input
                      type="range" min="18" max="70" value={val}
                      onChange={(e) => {
                        const n = parseInt(e.target.value);
                        if (field === "targetAgeMin") update("targetAgeMin", Math.min(n, productData.targetAgeMax));
                        else update("targetAgeMax", Math.max(n, productData.targetAgeMin));
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>
                ))}
                <div className="text-center">
                  <span className="text-sm font-bold text-violet-700 bg-white px-4 py-1.5 rounded-full border border-violet-200 shadow-sm">
                    {productData.targetAgeMin}〜{productData.targetAgeMax}歳
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                ターゲット年収層
              </label>
              <select
                value={productData.valueProposition.assumedNeeds || "中所得層"}
                onChange={(e) => updateValueProp("assumedNeeds", e.target.value)}
                className={selectCls}
              >
                <option value="">選択してください</option>
                <option value="低所得層">低所得層（年収200〜400万円）</option>
                <option value="中所得層">中所得層（年収400〜700万円）</option>
                <option value="高所得層">高所得層（年収700〜1000万円）</option>
                <option value="超高所得層">超高所得層（年収1000万円〜）</option>
                <option value="幅広い層">幅広い層</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                販売チャネル <span className="text-violet-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["オンライン", "実店舗", "両方"].map((v) => (
                  <button key={v} type="button" onClick={() => update("salesChannels", v)} className={chipBtn(productData.salesChannels === v)}>
                    {v}
                  </button>
                ))}
              </div>
              {errors.salesChannels && <p className="text-red-500 text-xs mt-1.5">{errors.salesChannels}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                製品の主な特徴 <span className="text-violet-500">*</span>
              </label>
              <textarea
                placeholder="例：4K映像対応、自動焦点調整、バッテリー8時間、軽量設計"
                value={productData.features.function}
                onChange={(e) => updateFeatures("function", e.target.value)}
                className={`${inputCls("features")} resize-none h-24`}
              />
              <p className="text-slate-400 text-xs mt-1.5">カンマ区切りで複数入力可</p>
              {errors.features && <p className="text-red-500 text-xs mt-1">{errors.features}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                コンセプト・デザイン
              </label>
              <textarea
                placeholder="例：ミニマルデザイン、プレミアム感、使いやすさ重視"
                value={productData.features.appearance}
                onChange={(e) => updateFeatures("appearance", e.target.value)}
                className={`${inputCls("appearance")} resize-none h-20`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                提供価値・ソリューション
              </label>
              <textarea
                placeholder="例：時間短縮、生活の質向上、エンターテイメント充実"
                value={productData.valueProposition.solutionHypothesis}
                onChange={(e) => updateValueProp("solutionHypothesis", e.target.value)}
                className={`${inputCls("solution")} resize-none h-20`}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">家族形態</label>
                <select value={productData.familyType} onChange={(e) => update("familyType", toFamilyType(e.target.value))} className={selectCls}>
                  <option value="">選択</option>
                  <option value="単身">単身</option>
                  <option value="夫婦のみ">夫婦のみ</option>
                  <option value="夫婦+子">夫婦+子</option>
                  <option value="ひとり親">ひとり親</option>
                  <option value="三世代同居">三世代同居</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">ペット保有</label>
                <select value={productData.petOwnership} onChange={(e) => update("petOwnership", toPetOwnership(e.target.value))} className={selectCls}>
                  <option value="">選択</option>
                  <option value="なし">なし</option>
                  <option value="犬">犬</option>
                  <option value="猫">猫</option>
                  <option value="両方">両方</option>
                  <option value="その他">その他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                想定年収 — <span className="text-violet-600 font-bold">{productData.detailedIncome}万円</span>
              </label>
              <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4">
                <input
                  type="range" min="0" max="2000" step="50"
                  value={productData.detailedIncome}
                  onChange={(e) => update("detailedIncome", parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>0万</span><span>500万</span><span>1000万</span><span>1500万</span><span>2000万</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">金融資産</label>
                <select value={productData.financialAssets} onChange={(e) => update("financialAssets", toFinancialAssets(e.target.value))} className={selectCls}>
                  <option value="">選択</option>
                  <option value="~100万">〜100万</option>
                  <option value="100~500万">100〜500万</option>
                  <option value="500~1000万">500〜1000万</option>
                  <option value="1000~3000万">1000〜3000万</option>
                  <option value="3000万以上">3000万以上</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">住居形態</label>
                <select value={productData.housingType} onChange={(e) => update("housingType", e.target.value as HousingType)} className={selectCls}>
                  <option value="">選択</option>
                  <option value="賃貸">賃貸</option>
                  <option value="持ち家(マンション)">持ち家(マンション)</option>
                  <option value="持ち家(戸建て)">持ち家(戸建て)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">趣味・嗜好</label>
              <textarea
                placeholder="例：読書、映画鑑賞、キャンプ、料理"
                value={productData.hobbies.join("、")}
                onChange={(e) => {
                  const hobbies = e.target.value.split(/[、,]/).map((h) => h.trim()).filter((h) => h.length > 0);
                  update("hobbies", hobbies);
                }}
                className={`${inputCls("hobbies")} resize-none h-20`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                デジタル利用度 — <span className="text-violet-600">Lv.{productData.digitalLiteracy}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level} type="button"
                    onClick={() => update("digitalLiteracy", level)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition ${
                      productData.digitalLiteracy === level
                        ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200"
                        : "bg-white text-slate-500 border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-0.5">
                <span>アナログ派</span><span>デジタルネイティブ</span>
              </div>
            </div>

            {/* 詳細属性ステップからも直接シミュレーション開始できるボタン */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition disabled:opacity-50 shadow-xl shadow-violet-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    実行中... {progress > 0 && `${progress}%`}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    100,000人シミュレーション開始
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-14 pb-10 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-4 py-1.5 text-xs text-violet-700 mb-5 font-semibold">
            <Sparkles className="w-3 h-3" />
            100,000人シミュレーション
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
            Persona<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Zen</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            15の質問から統計的に精確なペルソナ母集団を構築します
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar Steps */}
          <div className="hidden md:block">
            <div className="sticky top-20 space-y-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(i)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition border ${
                      active
                        ? "bg-violet-50 border-violet-200 shadow-sm"
                        : "hover:bg-slate-100 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        done ? "bg-emerald-500 text-white shadow-sm" : active ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "bg-slate-200 text-slate-500"
                      }`}>
                        {done ? "✓" : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${active ? "text-violet-800" : "text-slate-600"}`}>{s.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">生成される分析</p>
                <ul className="space-y-1.5">
                  {["4象限マッピング", "BIG5性格診断", "AIDMA分析", "カスタマージャーニー", "PDCA施策"].map((item) => (
                    <li key={item} className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Step Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="w-5 h-5 text-violet-600" />; })()}
                  <h2 className="text-base font-bold text-slate-800">{STEPS[currentStep].label}</h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">{currentStep + 1} / {STEPS.length}</span>
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= currentStep ? "bg-violet-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            <div className="px-8 py-7">{renderStep()}</div>

            {/* Footer Nav */}
            <div className="px-8 pb-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 transition border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </button>

              {currentStep < LAST_STEP ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.min(LAST_STEP, s + 1))}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white transition shadow-lg shadow-violet-200"
                >
                  次へ
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition disabled:opacity-50 shadow-xl shadow-violet-200"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      実行中... {progress > 0 && `${progress}%`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      シミュレーション開始
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-12 h-12 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-5" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">シミュレーション実行中</h3>
            <p className="text-sm text-slate-500 mb-5">100,000人の母集団を構築しています</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-violet-600 text-sm font-bold mt-2">{progress}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputForm;
