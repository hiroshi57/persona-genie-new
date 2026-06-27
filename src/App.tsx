import React, { useState, useEffect } from "react";
import {
  DEFAULT_PRODUCT_INFO, DEFAULT_SLIDER_PARAMETERS, DEFAULT_SCREENING_FILTERS,
} from "./types";
import type {
  ProductInfo, SliderParameters, SimulationResult,
  ScreeningFilters, PersonaDetails, AnalysisTab,
} from "./types";
import { useSimulationWorker } from "./useSimulationWorker";
import { validateProductForm, sanitizeText } from "./validation";
import InputForm from "./components/InputForm/InputForm";
import AnalysisView from "./components/Analysis/AnalysisView";
import { useToast, ToastContainer } from "./components/common/Toast";
import { checkPurchaseReturn, canUse, recordUse, showPaywall } from "./zenPaywall";

const POPULATION_SIZE = 100000;

const App: React.FC = () => {
  const [step, setStep] = useState<"input" | "analysis">("input");
  const [activeTab, setActiveTab] = useState<AnalysisTab>("simulation");

  const [productData, setProductData] = useState<ProductInfo>(DEFAULT_PRODUCT_INFO);
  const [sliderParams, setSliderParams] = useState<SliderParameters>(DEFAULT_SLIDER_PARAMETERS);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [screeningFilters, setScreeningFilters] = useState<ScreeningFilters>(DEFAULT_SCREENING_FILTERS);
  const [personas, setPersonas] = useState<PersonaDetails[] | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);

  const { toasts, addToast, removeToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { runSimulationAsync, progress, isRunning } = useSimulationWorker();

  // Stripe決済からの戻り（?zen_pro=1&slug=personazen）を検知して Pro を解放
  useEffect(() => {
    checkPurchaseReturn();
  }, []);

  const handleSubmit = async () => {
    // 課金ゲート: 無料上限に達していたらペイウォールを表示して中断
    if (!canUse()) {
      showPaywall();
      return;
    }

    const validationErrors = validateProductForm(productData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      addToast({ id: crypto.randomUUID(), message: "すべての必須項目を入力してください。", type: "error" });
      return;
    }

    const sanitized: ProductInfo = {
      ...productData,
      productName: sanitizeText(productData.productName),
      features: {
        appearance: sanitizeText(productData.features.appearance),
        function: sanitizeText(productData.features.function),
        concept: sanitizeText(productData.features.concept),
      },
      customerHypothesis: sanitizeText(productData.customerHypothesis),
      valueProposition: {
        assumedNeeds: sanitizeText(productData.valueProposition.assumedNeeds),
        solutionHypothesis: sanitizeText(productData.valueProposition.solutionHypothesis),
      },
    };

    try {
      const updatedSliderParams: SliderParameters = {
        ...sliderParams,
        targetAgeRange: [sanitized.targetAgeMin, sanitized.targetAgeMax],
      };
      setSliderParams(updatedSliderParams);

      const result = await runSimulationAsync(sanitized, updatedSliderParams, POPULATION_SIZE);
      setSimulationResult(result);
      setScreeningFilters(DEFAULT_SCREENING_FILTERS);
      setPersonas(null);
      setStep("analysis");
      recordUse(); // 成功した生成を1回分カウント（無料上限の消費）
    } catch (err) {
      addToast({ id: crypto.randomUUID(), message: "シミュレーション実行中にエラーが発生しました。", type: "error" });
      console.error(err);
    }
  };

  const handleReSimulate = async () => {
    try {
      const result = await runSimulationAsync(productData, sliderParams, POPULATION_SIZE);
      setSimulationResult(result);
      setPersonas(null);
    } catch (err) {
      addToast({ id: crypto.randomUUID(), message: "再シミュレーション中にエラーが発生しました。", type: "error" });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Global Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-200">
              P
            </div>
            <span className="text-slate-800 font-bold text-sm tracking-wide">PersonaZen</span>
            <span className="text-slate-400 text-xs font-medium ml-0.5">Pro</span>
          </div>
          {step === "analysis" && (
            <button
              onClick={() => setStep("input")}
              className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              新しい商品
            </button>
          )}
        </div>
      </header>

      <div className="pt-14">
        {step === "input" && (
          <InputForm
            productData={productData}
            setProductData={setProductData}
            onSubmit={handleSubmit}
            loading={isRunning}
            errors={errors}
            error={null}
            progress={progress}
          />
        )}

        {step === "analysis" && simulationResult && (
          <AnalysisView
            productData={productData}
            simulationResult={simulationResult}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sliderParams={sliderParams}
            setSliderParams={setSliderParams}
            screeningFilters={screeningFilters}
            setScreeningFilters={setScreeningFilters}
            onReSimulate={handleReSimulate}
            loading={isRunning}
            personas={personas}
            setPersonas={setPersonas}
            personaLoading={personaLoading}
            setPersonaLoading={setPersonaLoading}
            onBack={() => setStep("input")}
            progress={progress}
          />
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
