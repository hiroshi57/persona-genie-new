import React, { useState } from "react";
import { Download } from "lucide-react";
import type { PersonaDetails, SimulationResult } from "../../types";

interface ExportButtonProps {
  personas?: PersonaDetails[] | null;
  simulationResult?: SimulationResult | null;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPersonasJSON(personas: PersonaDetails[]) {
  const json = JSON.stringify(personas, null, 2);
  downloadFile("personas.json", json, "application/json");
}

function exportSimulationCSV(result: SimulationResult) {
  const stats = result.statistics;
  const rows: string[][] = [
    ["指標", "値"],
    ["総人数", String(stats.totalPersons)],
    ["平均年齢", String(stats.averageAge)],
    ["平均年収（万円）", String(stats.averageDetailedIncome)],
    ["平均デジタルリテラシー", String(stats.averageDigitalLiteracy)],
    ["", ""],
    ["象限", "人数"],
    ["Q1（高認知×高購買）", String(stats.quadrantDistribution.Q1)],
    ["Q2（低認知×高購買）", String(stats.quadrantDistribution.Q2)],
    ["Q3（低認知×低購買）", String(stats.quadrantDistribution.Q3)],
    ["Q4（高認知×低購買）", String(stats.quadrantDistribution.Q4)],
    ["", ""],
    ["家族形態", "人数"],
    ...Object.entries(stats.familyTypeDistribution).map(([k, v]) => [k, String(v)]),
    ["", ""],
    ["住居形態", "人数"],
    ...Object.entries(stats.housingTypeDistribution).map(([k, v]) => [k, String(v)]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  downloadFile("simulation_stats.csv", "\uFEFF" + csv, "text/csv"); // BOM付きでExcel対応
}

const ExportButton: React.FC<ExportButtonProps> = ({ personas, simulationResult }) => {
  const [open, setOpen] = useState(false);

  const hasPersonas = personas && personas.length > 0;
  const hasSimulation = !!simulationResult;

  if (!hasPersonas && !hasSimulation) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition shadow"
      >
        <Download size={16} />
        エクスポート
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {hasPersonas && (
              <button
                onClick={() => { exportPersonasJSON(personas!); setOpen(false); }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📄</span> ペルソナ JSON
              </button>
            )}
            {hasSimulation && (
              <button
                onClick={() => { exportSimulationCSV(simulationResult!); setOpen(false); }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
              >
                <span>📊</span> 統計データ CSV
              </button>
            )}
            {hasPersonas && (
              <button
                onClick={() => { window.print(); setOpen(false); }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
              >
                <span>🖨️</span> PDF印刷
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
