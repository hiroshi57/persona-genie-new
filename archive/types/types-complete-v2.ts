/**
 * types.ts - v2 完全版
 * SliderParameters + Simulation型 + PersonaDetails
 */

// ============================================================================
// 商品情報型
// ============================================================================

export interface ProductInfo {
  productName: string;
  category: string;
  releaseDate: string;
  price: number;
  salesChannels: string;
  targetAgeMin: number;
  targetAgeMax: number;
  features: {
    appearance: string;
    function: string;
    concept: string;
  };
  customerHypothesis: string;
  valueProposition: {
    assumedNeeds: string;
    solutionHypothesis: string;
  };
}

// ============================================================================
// スライダーパラメータ型（重要！）
// ============================================================================

export interface SliderParameters {
  priceAdjustment: number; // -50 ～ +50 (%)
  salesLocationExpansion: number; // 0 ～ 100 (%)
  targetAgeRange: [number, number]; // [最小, 最大]
  incomeTargetLevel: number; // 0 ～ 100 (レベル1-5)
  regionDiversity: number; // 0 ～ 100 (%)
}

export const DEFAULT_SLIDER_PARAMETERS: SliderParameters = {
  priceAdjustment: 0,
  salesLocationExpansion: 50,
  targetAgeRange: [20, 60],
  incomeTargetLevel: 50,
  regionDiversity: 50,
};

// ============================================================================
// シミュレーション関連型
// ============================================================================

export interface SimulatedPerson {
  id: string;
  name: string;
  age: number;
  awarenessScore: number; // 0-100
  purchaseIntentScore: number; // 0-100
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  occupation: string;
  income: "low" | "middle" | "high";
  region: string;
}

export interface SimulationStatistics {
  averageAge: number;
  totalPersons: number;
  quadrantDistribution: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  };
}

export interface SimulationResult {
  persons: SimulatedPerson[];
  statistics: SimulationStatistics;
}

// ============================================================================
// Big5性格診断型
// ============================================================================

export interface Big5Profile {
  openness: number; // 開放性
  conscientiousness: number; // 誠実性
  extraversion: number; // 外向性
  agreeableness: number; // 協調性
  neuroticism: number; // 神経症傾向
}

export interface Big5Interpretation {
  trait: keyof Big5Profile;
  score: number;
  level: "very-low" | "low" | "moderate" | "high" | "very-high";
  description: string;
}

// ============================================================================
// ペルソナ詳細型
// ============================================================================

export interface PersonaDetails {
  "基本情報": {
    名前: string;
    年齢: number;
    性別: string;
    職業: string;
    経済状況: string;
    教育レベル: string;
    家族構成: string;
    居住地: string;
  };
  "デモグラフィック情報": {
    宗教: string;
    文化背景: string;
    使用言語: string;
  };
  "サイコグラフィック情報": {
    ライフスタイル: string;
    価値観: string;
    "趣味・興味": string;
    パーソナリティ: string;
  };
  "行動情報": {
    購買行動の癖: string;
    情報収集方法: string;
    使用デバイス: string;
    よく使うメディア: string;
  };
  "目標動機欲求": {
    短期欲求: string;
    長期欲求: string;
    動機: string;
  };
  "課題ペインポイント": {
    "現在の課題、悩み": string;
    不満点: string;
    障壁: string;
  };
  "意思決定プロセス": {
    意思決定の流れ: string;
    "影響を受けやすい要因": string;
    "購入決定に関与する人物": string;
  };
  購入理由: string;
  AIDMA分析: {
    認知: string;
    興味: string;
    欲求: string;
    記憶: string;
    行動: string;
  };
  カスタマージャーニー: {
    認知段階: JourneyStage;
    検討段階: JourneyStage;
    決定段階: JourneyStage;
    購入段階: JourneyStage;
  };
  PDCA施策: {
    Plan: string;
    Do: string;
    Check: string;
    Action: string;
  };
  心理転換点: PsychologicalTrigger[];
  "5Big診断": {
    [key: string]: {
      スコア: number;
      説明: string;
    };
  };
  データソース: {
    "1次データソース": DataSourceItem[];
    "2次データソース": DataSourceItem[];
    信頼性スコア: number;
    データ根拠: string;
    "ターゲット属性": string;
  };
}

// ============================================================================
// サブ型
// ============================================================================

export interface JourneyStage {
  段階: string;
  状況: string;
  心理状態: string;
  行動: string;
  タッチポイント: string;
}

export interface PsychologicalTrigger {
  トリガー: string;
  発生場面: string;
  "心理的変化": string;
}

export interface DataSourceItem {
  機関名: string;
  データ名: string;
  URL: string;
  取得年: number;
  信頼度: "1次" | "2次";
}

// ============================================================================
// API応答型
// ============================================================================

export interface PersonaResponse {
  ペルソナA: PersonaDetails;
  ペルソナB: PersonaDetails;
  ペルソナC: PersonaDetails;
}

// ============================================================================
// AIDMA分析型
// ============================================================================

export interface AIDMAAnalysis {
  認知: string;
  興味: string;
  欲求: string;
  記憶: string;
  行動: string;
}

// ============================================================================
// デフォルト値
// ============================================================================

export const DEFAULT_PRODUCT_INFO: ProductInfo = {
  productName: "",
  category: "",
  releaseDate: "",
  price: 0,
  salesChannels: "",
  targetAgeMin: 20,
  targetAgeMax: 60,
  features: { appearance: "", function: "", concept: "" },
  customerHypothesis: "",
  valueProposition: { assumedNeeds: "", solutionHypothesis: "" },
};
