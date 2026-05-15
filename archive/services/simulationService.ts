/**
 * simulationService.ts - 1000人シミュレーション生成
 *
 * 製品情報に基づいて1000人の仮想顧客を生成し、
 * 属性分布を可視化するためのデータを提供
 */

export interface SimulatedPerson {
  id: number;
  age: number;
  gender: '男性' | '女性';
  region: string;
  income: string;
  occupation: string;
  purchaseIntent: number; // 0-100
}

export interface AgeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
  percentage: number;
}

export interface RegionDistribution {
  region: string;
  count: number;
  percentage: number;
}

export interface IncomeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface SimulationResult {
  totalCount: number;
  ageDistribution: AgeDistribution[];
  genderDistribution: GenderDistribution[];
  regionDistribution: RegionDistribution[];
  incomeDistribution: IncomeDistribution[];
  averagePurchaseIntent: number;
  highIntentCount: number; // 購買意欲70%以上
}

// 日本の地域
const REGIONS = [
  '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄'
];

// 年収レンジ
const INCOME_RANGES = [
  '300万未満', '300-500万', '500-700万', '700-1000万', '1000万以上'
];

// 職業カテゴリ
const OCCUPATIONS = [
  '会社員', '公務員', '自営業', '専業主婦/主夫', 'パート・アルバイト',
  '学生', 'フリーランス', '経営者', '無職・退職者'
];

/**
 * 製品カテゴリに基づいて年齢分布の重みを取得
 */
const getAgeWeightsByCategory = (category: string): number[] => {
  const categoryWeights: Record<string, number[]> = {
    // [10代, 20代, 30代, 40代, 50代, 60代以上]
    '美容': [5, 25, 30, 25, 10, 5],
    'ファッション': [10, 30, 25, 20, 10, 5],
    '家電': [5, 15, 25, 25, 20, 10],
    '食品': [5, 15, 20, 25, 20, 15],
    '金融': [2, 10, 25, 30, 25, 8],
    '保険': [2, 8, 25, 30, 25, 10],
    'ペット': [3, 15, 25, 25, 20, 12],
    '健康': [3, 10, 20, 25, 25, 17],
    'スポーツ': [15, 25, 25, 20, 10, 5],
    'デフォルト': [8, 18, 22, 22, 18, 12],
  };

  const normalizedCategory = Object.keys(categoryWeights).find(
    key => category.includes(key)
  ) || 'デフォルト';

  return categoryWeights[normalizedCategory];
};

/**
 * 価格帯に基づいて収入分布の重みを取得
 */
const getIncomeWeightsByPrice = (price: string): number[] => {
  const priceNum = parseInt(price.replace(/[^0-9]/g, '')) || 5000;

  if (priceNum < 3000) {
    // 低価格帯
    return [30, 35, 20, 10, 5];
  } else if (priceNum < 10000) {
    // 中価格帯
    return [20, 30, 25, 15, 10];
  } else if (priceNum < 50000) {
    // 高価格帯
    return [10, 20, 30, 25, 15];
  } else {
    // プレミアム価格帯
    return [5, 15, 25, 30, 25];
  }
};

/**
 * 重み付きランダム選択
 */
const weightedRandom = <T>(items: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
};

/**
 * 年齢を生成（重み付き）
 */
const generateAge = (weights: number[]): number => {
  const ageRanges = [
    { min: 15, max: 19 },
    { min: 20, max: 29 },
    { min: 30, max: 39 },
    { min: 40, max: 49 },
    { min: 50, max: 59 },
    { min: 60, max: 75 },
  ];

  const range = weightedRandom(ageRanges, weights);
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

/**
 * 購買意欲を計算
 */
const calculatePurchaseIntent = (
  age: number,
  income: string,
  targetAge?: number
): number => {
  let intent = 50; // 基本値

  // 年齢による調整
  if (targetAge) {
    const ageDiff = Math.abs(age - targetAge);
    intent += Math.max(0, 20 - ageDiff);
  }

  // 収入による調整
  const incomeBonus: Record<string, number> = {
    '300万未満': -10,
    '300-500万': 0,
    '500-700万': 10,
    '700-1000万': 15,
    '1000万以上': 20,
  };
  intent += incomeBonus[income] || 0;

  // ランダム変動
  intent += (Math.random() - 0.5) * 30;

  return Math.max(0, Math.min(100, Math.round(intent)));
};

/**
 * 1000人のシミュレーションを生成
 */
export const generateSimulation = (
  category: string,
  price: string,
  targetDescription: string
): SimulationResult => {
  const TOTAL_COUNT = 1000;
  const ageWeights = getAgeWeightsByCategory(category);
  const incomeWeights = getIncomeWeightsByPrice(price);

  // ターゲット年齢を推測
  const targetAgeMatch = targetDescription.match(/(\d+)代|(\d+)歳/);
  const targetAge = targetAgeMatch
    ? parseInt(targetAgeMatch[1] || targetAgeMatch[2])
    : undefined;

  const people: SimulatedPerson[] = [];

  for (let i = 0; i < TOTAL_COUNT; i++) {
    const age = generateAge(ageWeights);
    const gender = Math.random() > 0.48 ? '女性' : '男性';
    const region = weightedRandom(
      REGIONS,
      [5, 8, 35, 15, 18, 7, 4, 8] // 関東・近畿に重み
    );
    const income = weightedRandom(INCOME_RANGES, incomeWeights);
    const occupation = weightedRandom(
      OCCUPATIONS,
      [35, 8, 8, 10, 12, 5, 7, 5, 10]
    );

    people.push({
      id: i + 1,
      age,
      gender,
      region,
      income,
      occupation,
      purchaseIntent: calculatePurchaseIntent(age, income, targetAge),
    });
  }

  // 年齢分布を集計
  const ageRanges = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
  const ageDistribution: AgeDistribution[] = ageRanges.map((range, i) => {
    const minAge = i * 10 + 10;
    const maxAge = i === 5 ? 100 : minAge + 9;
    const count = people.filter(p => p.age >= minAge && p.age <= maxAge).length;
    return {
      range,
      count,
      percentage: Math.round((count / TOTAL_COUNT) * 100),
    };
  });

  // 性別分布
  const genderDistribution: GenderDistribution[] = ['男性', '女性'].map(gender => {
    const count = people.filter(p => p.gender === gender).length;
    return {
      gender,
      count,
      percentage: Math.round((count / TOTAL_COUNT) * 100),
    };
  });

  // 地域分布
  const regionDistribution: RegionDistribution[] = REGIONS.map(region => {
    const count = people.filter(p => p.region === region).length;
    return {
      region,
      count,
      percentage: Math.round((count / TOTAL_COUNT) * 100),
    };
  });

  // 収入分布
  const incomeDistribution: IncomeDistribution[] = INCOME_RANGES.map(range => {
    const count = people.filter(p => p.income === range).length;
    return {
      range,
      count,
      percentage: Math.round((count / TOTAL_COUNT) * 100),
    };
  });

  // 平均購買意欲
  const averagePurchaseIntent = Math.round(
    people.reduce((sum, p) => sum + p.purchaseIntent, 0) / TOTAL_COUNT
  );

  // 高購買意欲者数
  const highIntentCount = people.filter(p => p.purchaseIntent >= 70).length;

  return {
    totalCount: TOTAL_COUNT,
    ageDistribution,
    genderDistribution,
    regionDistribution,
    incomeDistribution,
    averagePurchaseIntent,
    highIntentCount,
  };
};
