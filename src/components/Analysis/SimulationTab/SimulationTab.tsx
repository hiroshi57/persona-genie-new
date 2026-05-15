import React, { useMemo } from "react";
import type { ProductInfo, SimulationResult, SliderParameters, ScreeningFilters } from "../../../types";
import { filterPersons, computeStatistics } from "../../../simulationCore";
import ParameterPanel from "./ParameterPanel";
import ScreeningPanel from "./ScreeningPanel";
import QuadrantDisplay from "./QuadrantDisplay";
import ScatterPlot from "./ScatterPlot";
import ScreeningResults from "./ScreeningResults";

interface SimulationTabProps {
  productData: ProductInfo;
  simulationResult: SimulationResult;
  sliderParams: SliderParameters;
  setSliderParams: (p: SliderParameters) => void;
  screeningFilters: ScreeningFilters;
  setScreeningFilters: (f: ScreeningFilters) => void;
  onReSimulate: () => void;
  loading: boolean;
}

const SimulationTab: React.FC<SimulationTabProps> = ({
  simulationResult, sliderParams, setSliderParams,
  screeningFilters, setScreeningFilters, onReSimulate, loading,
}) => {
  const filteredPersons = useMemo(
    () => filterPersons(simulationResult.persons, screeningFilters),
    [simulationResult.persons, screeningFilters]
  );

  const filteredStats = useMemo(
    () => computeStatistics(filteredPersons),
    [filteredPersons]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* 左ペイン */}
      <div className="lg:col-span-2 space-y-0 h-fit sticky top-4">
        <ParameterPanel
          sliderParams={sliderParams}
          setSliderParams={setSliderParams}
          onReSimulate={onReSimulate}
          loading={loading}
        />
        <ScreeningPanel
          filters={screeningFilters}
          setFilters={setScreeningFilters}
          totalCount={simulationResult.statistics.totalPersons}
          filteredCount={filteredPersons.length}
        />
      </div>

      {/* 右ペイン */}
      <div className="lg:col-span-3 space-y-8">
        {/* サマリーバー */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            母集団: <strong className="text-indigo-600">{simulationResult.statistics.totalPersons.toLocaleString()}人</strong>
          </p>
          <p className="text-sm text-slate-600">
            フィルタ後: <strong className="text-purple-600">{filteredPersons.length.toLocaleString()}人</strong>
          </p>
          <p className="text-sm text-slate-600">
            平均年齢: <strong>{filteredStats.averageAge}歳</strong>
          </p>
        </div>

        <QuadrantDisplay quadrantCounts={filteredStats.quadrantDistribution} />
        <ScatterPlot persons={filteredPersons} />
        <ScreeningResults persons={filteredPersons} statistics={filteredStats} />
      </div>
    </div>
  );
};

export default SimulationTab;
