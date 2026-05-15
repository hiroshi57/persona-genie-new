import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SimulatedPerson, SimulationStatistics } from "../../../types";

interface ScreeningResultsProps {
  persons: SimulatedPerson[];
  statistics: SimulationStatistics;
}

const ScreeningResults: React.FC<ScreeningResultsProps> = ({ persons, statistics }) => {
  const ageData = useMemo(() => {
    const bins = [
      { range: "18-24", min: 18, max: 24, count: 0 },
      { range: "25-34", min: 25, max: 34, count: 0 },
      { range: "35-44", min: 35, max: 44, count: 0 },
      { range: "45-54", min: 45, max: 54, count: 0 },
      { range: "55-64", min: 55, max: 64, count: 0 },
      { range: "65+", min: 65, max: 100, count: 0 },
    ];
    for (const p of persons) {
      const bin = bins.find((b) => p.age >= b.min && p.age <= b.max);
      if (bin) bin.count++;
    }
    return bins.map((b) => ({ name: b.range, 人数: b.count }));
  }, [persons]);

  const familyData = useMemo(() =>
    Object.entries(statistics.familyTypeDistribution)
      .filter(([k]) => k)
      .map(([name, count]) => ({ name, 人数: count })),
    [statistics.familyTypeDistribution]
  );

  const housingData = useMemo(() =>
    Object.entries(statistics.housingTypeDistribution)
      .filter(([k]) => k)
      .map(([name, count]) => ({ name, 人数: count })),
    [statistics.housingTypeDistribution]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">📈 フィルタ後の分布</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-slate-500">平均年齢:</span>
          <span className="font-bold text-slate-800 ml-2">{statistics.averageAge}歳</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-slate-500">平均年収:</span>
          <span className="font-bold text-slate-800 ml-2">{statistics.averageDetailedIncome}万円</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-slate-500">平均デジタル利用度:</span>
          <span className="font-bold text-slate-800 ml-2">{statistics.averageDigitalLiteracy}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-slate-500">総人数:</span>
          <span className="font-bold text-slate-800 ml-2">{statistics.totalPersons.toLocaleString()}人</span>
        </div>
      </div>

      {/* 年齢分布 */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">年齢分布</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="人数" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 家族形態分布 */}
      {familyData.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">家族形態分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={familyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="人数" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 住居形態分布 */}
      {housingData.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">住居形態分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="人数" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningResults;
