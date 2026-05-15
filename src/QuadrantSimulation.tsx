/**
 * QuadrantSimulation.tsx - 4象限シミュレーション
 *
 * スライダーで市場パラメータを調整し、
 * 1000人の分布と行動変容をリアルタイムで可視化
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Users, TrendingUp, Target, Zap } from 'lucide-react';

interface QuadrantSimulationProps {
  productName: string;
  category: string;
  onComplete: () => void;
}

interface SimulatedPerson {
  id: number;
  x: number; // 購買意欲 (0-100)
  y: number; // 製品適合度 (0-100)
  age: number;
  income: number;
  quadrant: 1 | 2 | 3 | 4;
}

interface QuadrantStats {
  quadrant: number;
  label: string;
  description: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

const TOTAL_PEOPLE = 1000;

const generatePeople = (
  priceLevel: number,
  marketingIntensity: number,
  targetAge: number
): SimulatedPerson[] => {
  const people: SimulatedPerson[] = [];

  for (let i = 0; i < TOTAL_PEOPLE; i++) {
    // 基本属性をランダム生成
    const age = 18 + Math.floor(Math.random() * 60);
    const income = 200 + Math.floor(Math.random() * 1200); // 200-1400万

    // 購買意欲（X軸）: マーケティング強度と収入に影響される
    let purchaseIntent = 30 + Math.random() * 40;
    purchaseIntent += (marketingIntensity / 100) * 25;
    purchaseIntent += (income > 600 ? 15 : -10);
    purchaseIntent += (Math.random() - 0.5) * 20;
    purchaseIntent = Math.max(0, Math.min(100, purchaseIntent));

    // 製品適合度（Y軸）: 年齢マッチングと価格感応度に影響される
    let productFit = 30 + Math.random() * 40;
    const ageDiff = Math.abs(age - targetAge);
    productFit += Math.max(0, 30 - ageDiff);
    productFit -= (priceLevel / 100) * (income < 500 ? 20 : 5);
    productFit += (Math.random() - 0.5) * 20;
    productFit = Math.max(0, Math.min(100, productFit));

    // 象限を決定
    let quadrant: 1 | 2 | 3 | 4;
    if (purchaseIntent >= 50 && productFit >= 50) quadrant = 1;
    else if (purchaseIntent < 50 && productFit >= 50) quadrant = 2;
    else if (purchaseIntent < 50 && productFit < 50) quadrant = 3;
    else quadrant = 4;

    people.push({
      id: i,
      x: purchaseIntent,
      y: productFit,
      age,
      income,
      quadrant,
    });
  }

  return people;
};

export const QuadrantSimulation: React.FC<QuadrantSimulationProps> = ({
  productName,
  category,
  onComplete,
}) => {
  // スライダーの状態
  const [priceLevel, setPriceLevel] = useState(50);
  const [marketingIntensity, setMarketingIntensity] = useState(50);
  const [targetAge, setTargetAge] = useState(35);

  // シミュレーション結果
  const people = useMemo(
    () => generatePeople(priceLevel, marketingIntensity, targetAge),
    [priceLevel, marketingIntensity, targetAge]
  );

  // 象限ごとの統計
  const quadrantStats: QuadrantStats[] = useMemo(() => {
    const counts = [0, 0, 0, 0];
    people.forEach(p => counts[p.quadrant - 1]++);

    return [
      {
        quadrant: 1,
        label: '即購入層',
        description: '高意欲 × 高適合',
        count: counts[0],
        percentage: Math.round((counts[0] / TOTAL_PEOPLE) * 100),
        color: 'bg-green-500',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        quadrant: 2,
        label: '検討層',
        description: '低意欲 × 高適合',
        count: counts[1],
        percentage: Math.round((counts[1] / TOTAL_PEOPLE) * 100),
        color: 'bg-yellow-500',
        icon: <Target className="w-4 h-4" />,
      },
      {
        quadrant: 3,
        label: '非ターゲット',
        description: '低意欲 × 低適合',
        count: counts[2],
        percentage: Math.round((counts[2] / TOTAL_PEOPLE) * 100),
        color: 'bg-gray-400',
        icon: <Users className="w-4 h-4" />,
      },
      {
        quadrant: 4,
        label: '潜在層',
        description: '高意欲 × 低適合',
        count: counts[3],
        percentage: Math.round((counts[3] / TOTAL_PEOPLE) * 100),
        color: 'bg-blue-500',
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ];
  }, [people]);

  // 市場予測
  const marketPrediction = useMemo(() => {
    const q1 = quadrantStats[0];
    const q2 = quadrantStats[1];
    const conversionRate = ((q1.count + q2.count * 0.3) / TOTAL_PEOPLE) * 100;
    const potentialRevenue = Math.round(q1.count * 10000 + q2.count * 3000);

    return {
      conversionRate: conversionRate.toFixed(1),
      potentialRevenue,
      immediateTarget: q1.count,
      nurturingTarget: q2.count,
    };
  }, [quadrantStats]);

  const handleSliderChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(parseInt(e.target.value));
      },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            市場シミュレーション
          </h1>
          <p className="text-slate-600">
            {productName} ({category}) - 1,000人の潜在顧客分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左: コントロールパネル */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              パラメータ調整
            </h2>

            {/* 価格設定スライダー */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  価格設定
                </label>
                <span className="text-sm text-indigo-600 font-bold">
                  {priceLevel < 33 ? '低価格' : priceLevel < 66 ? '中価格' : '高価格'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priceLevel}
                onChange={handleSliderChange(setPriceLevel)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>低</span>
                <span>高</span>
              </div>
            </div>

            {/* マーケティング強度スライダー */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  マーケティング強度
                </label>
                <span className="text-sm text-indigo-600 font-bold">
                  {marketingIntensity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={marketingIntensity}
                onChange={handleSliderChange(setMarketingIntensity)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>控えめ</span>
                <span>積極的</span>
              </div>
            </div>

            {/* ターゲット年齢スライダー */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  ターゲット年齢
                </label>
                <span className="text-sm text-indigo-600 font-bold">
                  {targetAge}歳
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="70"
                value={targetAge}
                onChange={handleSliderChange(setTargetAge)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>18歳</span>
                <span>70歳</span>
              </div>
            </div>

            {/* 市場予測 */}
            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <h3 className="text-sm font-bold text-indigo-800 mb-3">
                市場予測
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">予想CVR</span>
                  <span className="text-sm font-bold text-green-600">
                    {marketPrediction.conversionRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">即購入見込</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {marketPrediction.immediateTarget}人
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">育成対象</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {marketPrediction.nurturingTarget}人
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 中央: 4象限チャート */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">
              4象限マトリクス
            </h2>

            <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden">
              {/* 軸ラベル */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-medium">
                製品適合度 高
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-medium">
                製品適合度 低
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium writing-vertical">
                購買意欲 低
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium writing-vertical">
                購買意欲 高
              </div>

              {/* グリッド線 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-slate-300"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-slate-300"></div>
              </div>

              {/* 象限ラベル */}
              <div className="absolute top-4 right-4 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                Q1: 即購入
              </div>
              <div className="absolute top-4 left-4 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                Q2: 検討
              </div>
              <div className="absolute bottom-4 left-4 text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                Q3: 非対象
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Q4: 潜在
              </div>

              {/* 人をドットで表示 */}
              <svg className="absolute inset-0 w-full h-full">
                {people.map((person) => {
                  const cx = (person.x / 100) * 100;
                  const cy = 100 - (person.y / 100) * 100;
                  const colors = {
                    1: '#22c55e',
                    2: '#eab308',
                    3: '#9ca3af',
                    4: '#3b82f6',
                  };
                  return (
                    <circle
                      key={person.id}
                      cx={`${cx}%`}
                      cy={`${cy}%`}
                      r="2"
                      fill={colors[person.quadrant]}
                      opacity="0.6"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 右: 統計 */}
          <div className="space-y-4">
            {/* 象限別統計 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                象限別分布
              </h2>
              <div className="space-y-3">
                {quadrantStats.map((stat) => (
                  <div key={stat.quadrant} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                        <span className="text-sm font-medium text-slate-700">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {stat.count}人 ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color} transition-all duration-500`}
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 行動変容インサイト */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                行動変容インサイト
              </h2>
              <ul className="space-y-2 text-sm">
                {marketingIntensity > 60 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-300">✓</span>
                    マーケティング強化で購買意欲が上昇
                  </li>
                )}
                {priceLevel < 40 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-300">✓</span>
                    低価格戦略で幅広い層にリーチ
                  </li>
                )}
                {priceLevel > 70 && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">!</span>
                    高価格帯は高所得層に限定
                  </li>
                )}
                {quadrantStats[1].percentage > 25 && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300">→</span>
                    検討層{quadrantStats[1].count}人は育成で転換可能
                  </li>
                )}
              </ul>
            </div>

            {/* 次へボタン */}
            <button
              onClick={onComplete}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-5 h-5" />
              ペルソナを生成する
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
};

export default QuadrantSimulation;
