/**
 * big5Engine.ts - BIG5性格診断ローカル計算エンジン
 * 心理学研究に基づく年齢・職業・所得・デモグラフィック相関マッピング
 */

import type { SimulatedPerson, ComputedBig5 } from "./types";
import { clamp } from "./simulationCore";

// ============================================================================
// 職業別BIG5オフセット
// ============================================================================

const OCCUPATION_BIG5: Record<string, Partial<ComputedBig5>> = {
  "エンジニア":     { openness: 10, conscientiousness: 8, extraversion: -8, agreeableness: -3, neuroticism: 2 },
  "デザイナー":     { openness: 15, conscientiousness: 0, extraversion: 5, agreeableness: 3, neuroticism: 5 },
  "営業":           { openness: 0, conscientiousness: 3, extraversion: 15, agreeableness: 8, neuroticism: -3 },
  "マネージャー":   { openness: 5, conscientiousness: 12, extraversion: 10, agreeableness: 0, neuroticism: -5 },
  "教師":           { openness: 8, conscientiousness: 10, extraversion: 5, agreeableness: 12, neuroticism: 3 },
  "医者":           { openness: 5, conscientiousness: 15, extraversion: -3, agreeableness: 8, neuroticism: 5 },
  "弁護士":         { openness: 3, conscientiousness: 12, extraversion: 5, agreeableness: -5, neuroticism: 5 },
  "会計士":         { openness: -5, conscientiousness: 15, extraversion: -8, agreeableness: 3, neuroticism: 0 },
  "コンサルタント": { openness: 10, conscientiousness: 8, extraversion: 10, agreeableness: 0, neuroticism: 3 },
  "トレーダー":     { openness: 8, conscientiousness: 5, extraversion: 5, agreeableness: -5, neuroticism: 8 },
  "事務職":         { openness: -3, conscientiousness: 8, extraversion: -3, agreeableness: 5, neuroticism: 0 },
  "公務員":         { openness: -5, conscientiousness: 12, extraversion: -3, agreeableness: 5, neuroticism: -3 },
  "看護師":         { openness: 3, conscientiousness: 10, extraversion: 5, agreeableness: 15, neuroticism: 8 },
  "販売員":         { openness: 0, conscientiousness: 3, extraversion: 10, agreeableness: 10, neuroticism: 0 },
  "自営業":         { openness: 12, conscientiousness: 8, extraversion: 5, agreeableness: -3, neuroticism: 5 },
};

// ============================================================================
// 個人のBIG5計算
// ============================================================================

export function computeBig5(person: SimulatedPerson): ComputedBig5 {
  // ベーススコア（人口平均）
  let openness = 50;
  let conscientiousness = 50;
  let extraversion = 50;
  let agreeableness = 50;
  let neuroticism = 50;

  // 年齢相関（心理学研究ベース）
  const ageFactor = (person.age - 40) / 40;
  openness -= ageFactor * 8;
  conscientiousness += ageFactor * 10;
  agreeableness += ageFactor * 6;
  neuroticism -= ageFactor * 8;

  // 職業相関
  const occOffsets = OCCUPATION_BIG5[person.occupation];
  if (occOffsets) {
    openness += occOffsets.openness ?? 0;
    conscientiousness += occOffsets.conscientiousness ?? 0;
    extraversion += occOffsets.extraversion ?? 0;
    agreeableness += occOffsets.agreeableness ?? 0;
    neuroticism += occOffsets.neuroticism ?? 0;
  }

  // 所得相関（高所得→低不安、高誠実性）
  if (person.income === "high") {
    conscientiousness += 5;
    neuroticism -= 8;
  } else if (person.income === "low") {
    neuroticism += 5;
  }

  // デジタルリテラシー相関（高→高開放性）
  openness += ((person.digitalLiteracy ?? 3) - 3) * 4;

  // 家族形態相関
  if (person.familyType === '夫婦+子' || person.familyType === '三世代同居') {
    agreeableness += 5;
    conscientiousness += 3;
    neuroticism += 2;
  } else if (person.familyType === '単身') {
    extraversion -= 3;
    openness += 3;
  }

  // 住居相関（持ち家→高誠実性）
  if (person.housingType === '持ち家(戸建て)' || person.housingType === '持ち家(マンション)') {
    conscientiousness += 4;
    neuroticism -= 3;
  }

  // ランダム変動（±5）
  const jitter = () => (Math.random() - 0.5) * 10;
  openness += jitter();
  conscientiousness += jitter();
  extraversion += jitter();
  agreeableness += jitter();
  neuroticism += jitter();

  return {
    openness: Math.round(clamp(openness, 0, 100)),
    conscientiousness: Math.round(clamp(conscientiousness, 0, 100)),
    extraversion: Math.round(clamp(extraversion, 0, 100)),
    agreeableness: Math.round(clamp(agreeableness, 0, 100)),
    neuroticism: Math.round(clamp(neuroticism, 0, 100)),
  };
}

// ============================================================================
// 集団の平均BIG5計算（ペルソナ代表者用）
// ============================================================================

export function computeAggregateBig5(persons: SimulatedPerson[]): ComputedBig5 {
  if (persons.length === 0) {
    return { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
  }

  let totalO = 0, totalC = 0, totalE = 0, totalA = 0, totalN = 0;

  for (const p of persons) {
    const b = computeBig5(p);
    totalO += b.openness;
    totalC += b.conscientiousness;
    totalE += b.extraversion;
    totalA += b.agreeableness;
    totalN += b.neuroticism;
  }

  const n = persons.length;
  return {
    openness: Math.round(totalO / n),
    conscientiousness: Math.round(totalC / n),
    extraversion: Math.round(totalE / n),
    agreeableness: Math.round(totalA / n),
    neuroticism: Math.round(totalN / n),
  };
}
