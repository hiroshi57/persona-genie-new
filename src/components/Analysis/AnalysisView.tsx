import React from "react";
import type {
  ProductInfo, SimulationResult, SliderParameters,
  ScreeningFilters, PersonaDetails, AnalysisTab,
} from "../../types";
import TabNavigation from "../common/TabNavigation";
import SimulationTab from "./SimulationTab/SimulationTab";
import PersonaTab from "./PersonaTab/PersonaTab";
import ExportButton from "../common/ExportButton";
import { BarChart3, Users } from "lucide-react";

interface AnalysisViewProps {
  productData: ProductInfo;
  simulationResult: SimulationResult;
  activeTab: AnalysisTab;
  setActiveTab: (tab: AnalysisTab) => void;
  sliderParams: SliderParameters;
  setSliderParams: (p: SliderParameters) => void;
  screeningFilters: ScreeningFilters;
  setScreeningFilters: (f: ScreeningFilters) => void;
  onReSimulate: () => void;
  loading: boolean;
  personas: PersonaDetails[] | null;
  setPersonas: (p: PersonaDetails[] | null) => void;
  personaLoading: boolean;
  setPersonaLoading: (b: boolean) => void;
  onBack: () => void;
  progress?: number;
}

const TABS = [
  { key: "simulation", label: "シミュレーション", icon: BarChart3 },
  { key: "persona", label: "ペルソナ分析", icon: Users },
];

const AnalysisView: React.FC<AnalysisViewProps> = (props) => {
  const stats = props.simulationResult.statistics;
  const totalPersons = props.simulationResult.persons.length;
  const highAwareness = props.simulationResult.persons.filter(p => p.awarenessScore > 0.6).length;
  const highIntent = props.simulationResult.persons.filter(p => p.purchaseIntentScore > 0.6).length;
  const topQuadrant = Object.entries(stats.quadrantDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const metrics = [
    { label: "シミュレーション人口", value: totalPersons.toLocaleString(), unit: "人", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
    { label: "認知率", value: Math.round((highAwareness / totalPersons) * 100), unit: "%", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { label: "購買意向率", value: Math.round((highIntent / totalPersons) * 100), unit: "%", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "主要象限", value: topQuadrant, unit: "", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-1.5">
                {props.productData.productName}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                  {props.productData.category}
                </span>
                <span className="text-xs text-slate-400">
                  {props.productData.targetAgeMin}〜{props.productData.targetAgeMax}歳
                </span>
                <span className="text-xs text-slate-400">{props.productData.salesChannels}</span>
              </div>
            </div>
            <ExportButton personas={props.personas} simulationResult={props.simulationResult} />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map(({ label, value, unit, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-xl px-4 py-3.5`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                <p className={`text-2xl font-black ${color}`}>
                  {value}
                  <span className="text-sm font-semibold text-slate-400 ml-0.5">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="max-w-7xl mx-auto px-6 pt-5">
        <TabNavigation tabs={TABS} activeTab={props.activeTab} onChange={(k) => props.setActiveTab(k as AnalysisTab)} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {props.activeTab === "simulation" && (
          <SimulationTab
            productData={props.productData}
            simulationResult={props.simulationResult}
            sliderParams={props.sliderParams}
            setSliderParams={props.setSliderParams}
            screeningFilters={props.screeningFilters}
            setScreeningFilters={props.setScreeningFilters}
            onReSimulate={props.onReSimulate}
            loading={props.loading}
          />
        )}
        {props.activeTab === "persona" && (
          <PersonaTab
            simulationResult={props.simulationResult}
            productData={props.productData}
            personas={props.personas}
            setPersonas={props.setPersonas}
            personaLoading={props.personaLoading}
            setPersonaLoading={props.setPersonaLoading}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {props.loading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-12 h-12 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-5" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">再シミュレーション中</h3>
            <p className="text-sm text-slate-500 mb-5">パラメータを再計算しています</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${props.progress ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
