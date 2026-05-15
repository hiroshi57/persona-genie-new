/**
 * simulationCore.ts - シミュレーション純粋関数
 * Web WorkerとMain Threadの両方から使用可能
 */

import type {
  ProductInfo,
  SliderParameters,
  SimulatedPerson,
  SimulationStatistics,
  ScreeningFilters,
  FamilyType,
  PetOwnership,
  FinancialAssets,
  HousingType,
} from "./types";

// ============================================================================
// ユーティリティ関数
// ============================================================================

export function gaussianRandom(mean: number, stdev: number): number {
  let u1 = Math.random();
  while (u1 === 0) u1 = Math.random(); // log(0) = -Infinity を防ぐ
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdev;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ============================================================================
// データプール
// ============================================================================

export const OCCUPATIONS = [
  "営業", "エンジニア", "デザイナー", "マネージャー", "教師",
  "医者", "弁護士", "会計士", "コンサルタント", "トレーダー",
  "事務職", "公務員", "看護師", "販売員", "自営業",
];

export const REGIONS = [
  "東京都", "神奈川県", "千葉県", "埼玉県", "大阪府",
  "京都府", "兵庫県", "福岡県", "名古屋市", "仙台市",
  "札幌市", "広島市", "静岡県", "茨城県", "新潟県",
];

const FIRST_NAMES = [
  "田中", "山田", "鈴木", "佐藤", "高橋",
  "渡辺", "中村", "小林", "加藤", "伊藤",
  "松本", "井上", "木村", "林", "清水",
];

const LAST_NAMES = [
  "太郎", "花子", "次郎", "美咲", "健太",
  "由美", "翔太", "麗子", "悟", "千尋",
  "大輔", "愛", "拓也", "さくら", "浩二",
];

export const HOBBIES_POOL = [
  "読書", "旅行", "映画鑑賞", "料理", "ジョギング",
  "ヨガ", "カメラ", "ゲーム", "キャンプ", "釣り",
  "園芸", "DIY", "音楽鑑賞", "楽器演奏", "ゴルフ",
  "テニス", "サイクリング", "カフェ巡り", "SNS投稿", "投資",
  "ペットの世話", "ワイン", "ハンドメイド", "温泉巡り", "アニメ",
  "プログラミング", "ダンス", "登山", "水泳", "美術館巡り",
];

const FAMILY_TYPES: FamilyType[] = ['単身', '夫婦のみ', '夫婦+子', 'ひとり親', '三世代同居'];
const PET_OPTIONS: PetOwnership[] = ['なし', '犬', '猫', '両方', 'その他'];
const FINANCIAL_ASSETS_OPTIONS: FinancialAssets[] = ['~100万', '100~500万', '500~1000万', '1000~3000万', '3000万以上'];
const HOUSING_TYPES: HousingType[] = ['賃貸', '持ち家(マンション)', '持ち家(戸建て)'];

// ============================================================================
// 年齢相関の家族形態分布
// ============================================================================

function generateFamilyType(age: number): FamilyType {
  if (age < 25) {
    return weightedRandom(FAMILY_TYPES, [70, 5, 3, 2, 0]);
  } else if (age < 35) {
    return weightedRandom(FAMILY_TYPES, [40, 25, 25, 5, 5]);
  } else if (age < 50) {
    return weightedRandom(FAMILY_TYPES, [15, 15, 50, 10, 10]);
  } else if (age < 65) {
    return weightedRandom(FAMILY_TYPES, [10, 25, 40, 10, 15]);
  } else {
    return weightedRandom(FAMILY_TYPES, [15, 35, 20, 10, 20]);
  }
}

// ============================================================================
// 住居形態×年齢×地域相関
// ============================================================================

function generateHousingType(age: number, income: "low" | "middle" | "high", region: string): HousingType {
  const isUrban = ["東京都", "大阪府", "神奈川県", "名古屋市"].includes(region);
  if (age < 30) {
    return isUrban
      ? weightedRandom(HOUSING_TYPES, [80, 15, 5])
      : weightedRandom(HOUSING_TYPES, [60, 10, 30]);
  } else if (income === "high") {
    return isUrban
      ? weightedRandom(HOUSING_TYPES, [20, 50, 30])
      : weightedRandom(HOUSING_TYPES, [10, 20, 70]);
  } else {
    return isUrban
      ? weightedRandom(HOUSING_TYPES, [50, 30, 20])
      : weightedRandom(HOUSING_TYPES, [30, 15, 55]);
  }
}

// ============================================================================
// ペット保有×住居×家族相関
// ============================================================================

function generatePetOwnership(housingType: HousingType, familyType: FamilyType): PetOwnership {
  if (housingType === '賃貸') {
    return weightedRandom(PET_OPTIONS, [70, 10, 10, 3, 7]);
  }
  if (familyType === '夫婦+子' || familyType === '三世代同居') {
    return weightedRandom(PET_OPTIONS, [30, 25, 20, 15, 10]);
  }
  return weightedRandom(PET_OPTIONS, [50, 20, 15, 8, 7]);
}

// ============================================================================
// 詳細年収生成（年齢×職業相関）
// ============================================================================

function generateDetailedIncome(age: number, occupation: string, income: "low" | "middle" | "high"): number {
  const baseByIncome = { low: 250, middle: 500, high: 900 };
  let base = baseByIncome[income];

  // 年齢による補正（40-55歳がピーク）
  if (age < 30) base *= 0.7;
  else if (age < 40) base *= 0.9;
  else if (age < 55) base *= 1.15;
  else base *= 0.85;

  // 職業による補正
  const highIncomeOccupations = ["医者", "弁護士", "コンサルタント", "トレーダー", "マネージャー"];
  if (highIncomeOccupations.includes(occupation)) base *= 1.3;

  return Math.round(clamp(gaussianRandom(base, base * 0.2), 100, 2000));
}

// ============================================================================
// 金融資産生成（年齢×収入相関）
// ============================================================================

function generateFinancialAssets(age: number, detailedIncome: number): FinancialAssets {
  const wealthFactor = (age / 50) * (detailedIncome / 500);
  if (wealthFactor < 0.5) return weightedRandom(FINANCIAL_ASSETS_OPTIONS, [60, 30, 8, 2, 0]);
  if (wealthFactor < 1.0) return weightedRandom(FINANCIAL_ASSETS_OPTIONS, [25, 40, 25, 8, 2]);
  if (wealthFactor < 1.5) return weightedRandom(FINANCIAL_ASSETS_OPTIONS, [10, 20, 35, 25, 10]);
  return weightedRandom(FINANCIAL_ASSETS_OPTIONS, [5, 10, 20, 35, 30]);
}

// ============================================================================
// デジタルリテラシー生成（年齢×職業相関）
// ============================================================================

function generateDigitalLiteracy(age: number, occupation: string): number {
  let base = 3;
  if (age < 25) base = 4.5;
  else if (age < 35) base = 4;
  else if (age < 50) base = 3;
  else if (age < 65) base = 2.5;
  else base = 1.5;

  const techOccupations = ["エンジニア", "デザイナー", "コンサルタント", "トレーダー"];
  if (techOccupations.includes(occupation)) base += 0.8;

  return Math.round(clamp(gaussianRandom(base, 0.8), 1, 5));
}

// ============================================================================
// 趣味生成（年齢×デジタルリテラシー相関）
// ============================================================================

function generateHobbies(age: number, digitalLiteracy: number): string[] {
  const count = 2 + Math.floor(Math.random() * 3); // 2-4個
  const selected = new Set<string>();

  // デジタル系趣味は若い人・デジタルリテラシー高い人に多い
  const digitalHobbies = ["ゲーム", "SNS投稿", "プログラミング", "アニメ"];

  while (selected.size < count) {
    if (digitalLiteracy >= 4 && Math.random() < 0.4 && selected.size < 2) {
      selected.add(digitalHobbies[Math.floor(Math.random() * digitalHobbies.length)]);
    } else if (age > 50 && Math.random() < 0.3) {
      selected.add(weightedRandom(["園芸", "温泉巡り", "ゴルフ", "読書", "旅行"], [1, 1, 1, 1, 1]));
    } else {
      selected.add(HOBBIES_POOL[Math.floor(Math.random() * HOBBIES_POOL.length)]);
    }
  }

  return Array.from(selected);
}

// ============================================================================
// 単一人物生成
// ============================================================================

export function generateSinglePerson(
  index: number,
  _productData: ProductInfo,
  sliderParams: SliderParameters
): SimulatedPerson {
  const ageOffset = (sliderParams.targetAgeRange[0] + sliderParams.targetAgeRange[1]) / 2 - 40;
  const priceImpact = sliderParams.priceAdjustment / 100;
  const salesImpact = sliderParams.salesLocationExpansion / 100;
  const incomeImpact = sliderParams.incomeTargetLevel / 100;
  const regionDiversityImpact = sliderParams.regionDiversity / 100;

  // 年齢
  const age = Math.round(clamp(gaussianRandom(40 + ageOffset, 15), 18, 75));

  // 名前
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${firstName}${lastName}`;

  // 職業
  const occupation = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];

  // 所得カテゴリ
  const incomeRandom = Math.random();
  let income: "low" | "middle" | "high";
  if (incomeRandom < 0.3) income = "low";
  else if (incomeRandom < 0.7) income = "middle";
  else income = "high";

  // 地域
  let region: string;
  if (regionDiversityImpact > 0.7) {
    region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  } else if (regionDiversityImpact > 0.3) {
    region = REGIONS[Math.floor(Math.random() * 7)]; // 主要7地域
  } else {
    region = "東京都";
  }

  // 新規フィールド生成
  const familyType = generateFamilyType(age);
  const housingType = generateHousingType(age, income, region);
  const petOwnership = generatePetOwnership(housingType, familyType);
  const detailedIncome = generateDetailedIncome(age, occupation, income);
  const financialAssets = generateFinancialAssets(age, detailedIncome);
  const digitalLiteracy = generateDigitalLiteracy(age, occupation);
  const hobbies = generateHobbies(age, digitalLiteracy);

  // 認知度スコア
  const baseAwareness = Math.random() * 60;
  const awarenessBySales = salesImpact * 30;
  const awarenessAdjustment = age > 50 ? 10 : age < 25 ? -5 : 0;
  const digitalAwarenessBonus = digitalLiteracy >= 4 ? 5 : 0;
  const awarenessScore = Math.round(clamp(
    baseAwareness + awarenessBySales + awarenessAdjustment + digitalAwarenessBonus,
    0, 100
  ));

  // 購買意欲スコア
  const basePurchaseIntent = Math.random() * 60;
  const purchaseIntentByIncome = incomeImpact * 30;
  const purchaseIntentByPrice = -priceImpact * 20;
  const purchaseIntentByAge = age > 45 && age < 65 ? 15 : -5;
  const assetBonus = ['1000~3000万', '3000万以上'].includes(financialAssets) ? 8 : 0;
  const purchaseIntentScore = Math.round(clamp(
    basePurchaseIntent + purchaseIntentByIncome + purchaseIntentByPrice + purchaseIntentByAge + assetBonus,
    0, 100
  ));

  // 象限判定
  let quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  if (awarenessScore >= 50 && purchaseIntentScore >= 50) quadrant = "Q1";
  else if (awarenessScore < 50 && purchaseIntentScore >= 50) quadrant = "Q2";
  else if (awarenessScore < 50 && purchaseIntentScore < 50) quadrant = "Q3";
  else quadrant = "Q4";

  return {
    id: `person-${index}`,
    name,
    age,
    awarenessScore,
    purchaseIntentScore,
    quadrant,
    occupation,
    income,
    region,
    familyType,
    petOwnership,
    detailedIncome,
    financialAssets,
    housingType,
    hobbies,
    digitalLiteracy,
  };
}

// ============================================================================
// 統計計算
// ============================================================================

export function computeStatistics(persons: SimulatedPerson[]): SimulationStatistics {
  const total = persons.length;
  if (total === 0) {
    return {
      averageAge: 0,
      totalPersons: 0,
      quadrantDistribution: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      familyTypeDistribution: {},
      housingTypeDistribution: {},
      averageDigitalLiteracy: 0,
      averageDetailedIncome: 0,
    };
  }

  const quadrantDistribution = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const familyTypeDistribution: Record<string, number> = {};
  const housingTypeDistribution: Record<string, number> = {};
  let totalAge = 0;
  let totalDigitalLiteracy = 0;
  let totalDetailedIncome = 0;

  for (const p of persons) {
    totalAge += p.age;
    totalDigitalLiteracy += p.digitalLiteracy;
    totalDetailedIncome += p.detailedIncome;
    quadrantDistribution[p.quadrant]++;
    familyTypeDistribution[p.familyType] = (familyTypeDistribution[p.familyType] || 0) + 1;
    housingTypeDistribution[p.housingType] = (housingTypeDistribution[p.housingType] || 0) + 1;
  }

  return {
    averageAge: Math.round(totalAge / total),
    totalPersons: total,
    quadrantDistribution,
    familyTypeDistribution,
    housingTypeDistribution,
    averageDigitalLiteracy: Math.round((totalDigitalLiteracy / total) * 10) / 10,
    averageDetailedIncome: Math.round(totalDetailedIncome / total),
  };
}

// ============================================================================
// スクリーニングフィルタ
// ============================================================================

export function filterPersons(
  persons: SimulatedPerson[],
  filters: ScreeningFilters
): SimulatedPerson[] {
  return persons.filter((p) => {
    if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1]) return false;
    if (p.detailedIncome < filters.incomeRange[0] || p.detailedIncome > filters.incomeRange[1]) return false;
    if (filters.familyTypes.length > 0 && !filters.familyTypes.includes(p.familyType)) return false;
    if (filters.petOwnerships.length > 0 && !filters.petOwnerships.includes(p.petOwnership)) return false;
    if (filters.housingTypes.length > 0 && !filters.housingTypes.includes(p.housingType)) return false;
    if (p.digitalLiteracy < filters.digitalLiteracyRange[0] || p.digitalLiteracy > filters.digitalLiteracyRange[1]) return false;
    if (filters.quadrants.length > 0 && !filters.quadrants.includes(p.quadrant)) return false;
    if (filters.occupations.length > 0 && !filters.occupations.includes(p.occupation)) return false;
    if (filters.regions.length > 0 && !filters.regions.includes(p.region)) return false;
    return true;
  });
}
