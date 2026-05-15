/**
 * types-extended.ts - 完全版型定義
 * 5Big診断、改善版データソース対応
 */

// ========== 基本型 ==========

export interface ProductInfo {
  productName: string;
  category: string;
  releaseDate: string;
  price: string;
  salesChannels: string;
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

// ========== AIDMA分析 ==========

export interface AIDMAAnalysis {
  "認知": string;
  "興味": string;
  "欲求": string;
  "記憶": string;
  "行動": string;
}

// ========== カスタマージャーニー ==========

export interface JourneyStage {
  "段階": string;
  "状況": string;
  "心理状態": string;
  "行動": string;
  "タッチポイント": string;
}

export interface CustomerJourney {
  "認知段階": JourneyStage;
  "検討段階": JourneyStage;
  "決定段階": JourneyStage;
  "購入段階": JourneyStage;
}

// ========== PDCA施策 ==========

export interface PDCACycle {
  "Plan": string;
  "Do": string;
  "Check": string;
  "Action": string;
}

// ========== 心理転換点 ==========

export interface PsychologicalTrigger {
  "トリガー": string;
  "発生場面": string;
  "心理的変化": string;
}

// ========== 5Big診断（新規追加） ==========

export interface BigFiveTraits {
  "開放性": {
    "スコア": number; // 0-100
    "説明": string;
  };
  "誠実性": {
    "スコア": number;
    "説明": string;
  };
  "外向性": {
    "スコア": number;
    "説明": string;
  };
  "協調性": {
    "スコア": number;
    "説明": string;
  };
  "神経症傾向": {
    "スコア": number;
    "説明": string;
  };
}

// ========== データソース（改善版） ==========

export interface DataSourceEntry {
  "機関名": string;
  "データ名": string;
  "URL": string;
  "取得年": number;
  "信頼度": "1次" | "2次";
}

export interface DataSource {
  "1次データソース": DataSourceEntry[];
  "2次データソース": DataSourceEntry[];
  "信頼性スコア": 100; // 常に100（検証済みのみ）
  "データ根拠": string;
  "ターゲット属性": string;
}

// ========== ペルソナ詳細情報（改善版） ==========

export interface PersonaDetails {
  "基本情報": {
    "名前": string;
    "年齢": number;
    "性別": "男性" | "女性";
    "職業": string;
    "経済状況": string;
    "教育レベル": string;
    "家族構成": string;
    "居住地": string;
  };
  "デモグラフィック情報": {
    "宗教": string;
    "文化背景": string;
    "使用言語": string;
  };
  "サイコグラフィック情報": {
    "ライフスタイル": string;
    "価値観": string;
    "趣味・興味": string;
    "パーソナリティ": string;
  };
  "行動情報": {
    "購買行動の癖": string;
    "情報収集方法": string;
    "使用デバイス": string;
    "よく使うメディア": string;
  };
  "目標動機欲求": {
    "短期欲求": string;
    "長期欲求": string;
    "動機": string;
  };
  "課題ペインポイント": {
    "現在の課題、悩み": string;
    "不満点": string;
    "障壁": string;
  };
  "意思決定プロセス": {
    "意思決定の流れ": string;
    "影響を受けやすい要因": string;
    "購入決定に関与する人物": string;
  };
  "購入理由": string;
  
  // 分析タブ用データ
  "AIDMA分析": AIDMAAnalysis;
  "カスタマージャーニー": CustomerJourney;
  "PDCA施策": PDCACycle;
  "心理転換点": PsychologicalTrigger[];
  "5Big診断": BigFiveTraits; // 新規追加
  "データソース": DataSource;
}

// ========== ペルソナレスポンス ==========

export interface PersonaResponse {
  "ペルソナA": PersonaDetails;
  "ペルソナB": PersonaDetails;
  "ペルソナC": PersonaDetails;
}

// ========== シミュレーション関連型 ==========

export interface SimulationPerson {
  id: string;
  age: number;
  price: number;
  salesLocation: number; // 0-100 (%)
  income: number; // 年間所得（万円）
  region: number; // 0-100 (%)
  recognitionScore: number; // 認知度 0-100
  purchaseIntent: number; // 購買意欲 0-100
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
}

export interface SimulationResult {
  persons: SimulationPerson[];
  statistics: {
    averageAge: number;
    averageIncome: number;
    averagePurchaseIntent: number;
    quadrantCounts: {
      "Q1": number;
      "Q2": number;
      "Q3": number;
      "Q4": number;
    };
  };
}

// ========== UI状態 ==========

export type AppStep = "input" | "analysis" | "personas";

export interface AppState {
  step: AppStep;
  productData: ProductInfo | null;
  simulationResult: SimulationResult | null;
  personas: PersonaResponse | null;
  loading: boolean;
  error: string | null;
}

// ========== デフォルト値 ==========

export const DEFAULT_PRODUCT_INFO: ProductInfo = {
  productName: "",
  category: "",
  releaseDate: "",
  price: "",
  salesChannels: "",
  features: { appearance: "", function: "", concept: "" },
  customerHypothesis: "",
  valueProposition: { assumedNeeds: "", solutionHypothesis: "" },
};
