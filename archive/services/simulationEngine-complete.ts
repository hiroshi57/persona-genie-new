/**
 * simulationEngine.ts - v2 シミュレーション実装
 * パラメータに基づいて1000人のシミュレーション人口を生成
 */

import { ProductInfo, SliderParameters, SimulatedPerson, SimulationResult } from "./types";

// ============================================================================
// ユーティリティ関数
// ============================================================================

/** 正規分布に従う乱数生成（Box-Muller変換） */
function gaussianRandom(mean: number, stdev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdev;
}

/** 範囲内に値をクリップ */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// シミュレーション実装
// ============================================================================

export function runSimulation(
  productData: ProductInfo,
  sliderParams: SliderParameters,
  populationSize: number = 1000
): SimulationResult {
  const persons: SimulatedPerson[] = [];

  // 職業リスト
  const occupations = [
    "営業",
    "エンジニア",
    "デザイナー",
    "マネージャー",
    "教師",
    "医者",
    "弁護士",
    "会計士",
    "コンサルタント",
    "トレーダー",
  ];

  // 地域リスト
  const regions = [
    "東京都",
    "神奈川県",
    "千葉県",
    "埼玉県",
    "大阪府",
    "京都府",
    "兵庫県",
    "福岡県",
    "名古屋市",
    "仙台市",
  ];

  // 名前リスト（ランダム）
  const firstNames = [
    "田中",
    "山田",
    "鈴木",
    "佐藤",
    "高橋",
    "渡辺",
    "中村",
    "小林",
    "加藤",
    "伊藤",
  ];
  const lastNames = [
    "太郎",
    "花子",
    "次郎",
    "美咲",
    "健太",
    "由美",
    "翔太",
    "麗子",
    "悟",
    "千尋",
  ];

  // ========== パラメータの影響計算 ==========
  const ageOffset = (sliderParams.targetAgeRange[0] + sliderParams.targetAgeRange[1]) / 2 - 40;
  const priceImpact = sliderParams.priceAdjustment / 100; // 価格は購買意欲に負の影響
  const salesImpact = sliderParams.salesLocationExpansion / 100; // 販売地拡大は認知度を上げる
  const incomeImpact = sliderParams.incomeTargetLevel / 100; // 所得水準は購買意欲に影響
  const regionDiversityImpact = sliderParams.regionDiversity / 100;

  // ========== 1000人生成 ==========
  for (let i = 0; i < populationSize; i++) {
    // 基本属性
    const age = clamp(
      gaussianRandom(40 + ageOffset, 15),
      18,
      75
    );

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName}${lastName}`;

    // 職業と所得
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const incomeRandom = Math.random();
    let income: "low" | "middle" | "high";
    if (incomeRandom < 0.3) {
      income = "low";
    } else if (incomeRandom < 0.7) {
      income = "middle";
    } else {
      income = "high";
    }

    // 地域
    let region: string;
    if (regionDiversityImpact > 0.7) {
      region = regions[Math.floor(Math.random() * regions.length)];
    } else {
      region = "東京都"; // 地域多様性が低い場合は東京集中
    }

    // ========== スコア計算 ==========

    // 認知度スコア（0-100）
    // - 販売チャネル拡大により向上
    // - 年齢と価格の影響を受ける
    const baseAwareness = Math.random() * 60; // ベース30-90
    const awarenessBySales = salesImpact * 30; // 販売拡大で最大+30
    const awarenessAdjustment = age > 50 ? 10 : age < 25 ? -5 : 0;
    const awarenessScore = clamp(
      baseAwareness + awarenessBySales + awarenessAdjustment,
      0,
      100
    );

    // 購買意欲スコア（0-100）
    // - 所得水準が高いと向上
    // - 価格が高いと低下
    // - 年齢により異なる
    const basePurchaseIntent = Math.random() * 60;
    const purchaseIntentByIncome = incomeImpact * 30; // 所得で最大+30
    const purchaseIntentByPrice = -priceImpact * 20; // 価格が高いと-20
    const purchaseIntentByAge = age > 45 && age < 65 ? 15 : -5; // 中年層は購買意欲高
    const purchaseIntentScore = clamp(
      basePurchaseIntent + purchaseIntentByIncome + purchaseIntentByPrice + purchaseIntentByAge,
      0,
      100
    );

    // ========== 象限判定 ==========
    let quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    const awarenessThreshold = 50;
    const intentThreshold = 50;

    if (awarenessScore >= awarenessThreshold && purchaseIntentScore >= intentThreshold) {
      quadrant = "Q1"; // 高認知×高欲望
    } else if (awarenessScore < awarenessThreshold && purchaseIntentScore >= intentThreshold) {
      quadrant = "Q2"; // 低認知×高欲望
    } else if (awarenessScore < awarenessThreshold && purchaseIntentScore < intentThreshold) {
      quadrant = "Q3"; // 低認知×低欲望
    } else {
      quadrant = "Q4"; // 高認知×低欲望
    }

    // ========== 人物追加 ==========
    persons.push({
      id: `person-${i}`,
      name,
      age: Math.round(age),
      awarenessScore: Math.round(awarenessScore),
      purchaseIntentScore: Math.round(purchaseIntentScore),
      quadrant,
      occupation,
      income,
      region,
    });
  }

  // ========== 統計計算 ==========
  const quadrantDistribution = {
    Q1: persons.filter((p) => p.quadrant === "Q1").length,
    Q2: persons.filter((p) => p.quadrant === "Q2").length,
    Q3: persons.filter((p) => p.quadrant === "Q3").length,
    Q4: persons.filter((p) => p.quadrant === "Q4").length,
  };

  const averageAge = Math.round(persons.reduce((sum, p) => sum + p.age, 0) / persons.length);

  return {
    persons,
    statistics: {
      averageAge,
      totalPersons: populationSize,
      quadrantDistribution,
    },
  };
}
