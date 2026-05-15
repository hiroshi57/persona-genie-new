/**
 * types.ts - v3 完全版
 * 15項目入力 + 100K シミュレーション + スクリーニング + ペルソナ分析
 */

// ============================================================================
// 新規 Union 型（入力フォーム項目9-15用）
// ============================================================================

export type FamilyType = '' | '単身' | '夫婦のみ' | '夫婦+子' | 'ひとり親' | '三世代同居';
export type PetOwnership = '' | 'なし' | '犬' | '猫' | '両方' | 'その他';
export type FinancialAssets = '' | '~100万' | '100~500万' | '500~1000万' | '1000~3000万' | '3000万以上';
export type HousingType = '' | '賃貸' | '持ち家(マンション)' | '持ち家(戸建て)';
export type AnalysisTab = 'simulation' | 'persona';

// ============================================================================
// 商品情報型（15項目対応）
// ============================================================================

export interface ProductInfo {
  // 第1セクション: 商品基本 (1-3)
  productName: string;
  category: string;
  releaseDate: string;
  price: number;

  // 第2セクション: ターゲット (4-6)
  salesChannels: string;
  targetAgeMin: number;
  targetAgeMax: number;

  // 第3セクション: 製品・価値 (7-8)
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

  // 第4セクション: 詳細属性 (9-15) ★新規
  familyType: FamilyType;
  petOwnership: PetOwnership;
  detailedIncome: number;          // 万円単位 (0~2000)
  financialAssets: FinancialAssets;
  housingType: HousingType;
  hobbies: string[];
  digitalLiteracy: number;         // 1-5
}

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
  familyType: '',
  petOwnership: '',
  detailedIncome: 500,
  financialAssets: '',
  housingType: '',
  hobbies: [],
  digitalLiteracy: 3,
};

// ============================================================================
// スライダーパラメータ型
// ============================================================================

export interface SliderParameters {
  priceAdjustment: number;          // -50 ～ +50 (%)
  salesLocationExpansion: number;   // 0 ～ 100 (%)
  targetAgeRange: [number, number]; // [最小, 最大]
  incomeTargetLevel: number;        // 0 ～ 100 (レベル1-5)
  regionDiversity: number;          // 0 ～ 100 (%)
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
  awarenessScore: number;           // 0-100
  purchaseIntentScore: number;      // 0-100
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  occupation: string;
  income: "low" | "middle" | "high";
  region: string;
  // ★新規 7フィールド
  familyType: FamilyType;
  petOwnership: PetOwnership;
  detailedIncome: number;           // 万円
  financialAssets: FinancialAssets;
  housingType: HousingType;
  hobbies: string[];
  digitalLiteracy: number;          // 1-5
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
  // ★新規 拡張統計
  familyTypeDistribution: Record<string, number>;
  housingTypeDistribution: Record<string, number>;
  averageDigitalLiteracy: number;
  averageDetailedIncome: number;
}

export interface SimulationResult {
  persons: SimulatedPerson[];
  statistics: SimulationStatistics;
}

// ============================================================================
// スクリーニングフィルタ型
// ============================================================================

export interface ScreeningFilters {
  ageRange: [number, number];
  incomeRange: [number, number];
  familyTypes: FamilyType[];
  petOwnerships: PetOwnership[];
  housingTypes: HousingType[];
  digitalLiteracyRange: [number, number];
  quadrants: ("Q1" | "Q2" | "Q3" | "Q4")[];
  occupations: string[];
  regions: string[];
}

export const DEFAULT_SCREENING_FILTERS: ScreeningFilters = {
  ageRange: [18, 75],
  incomeRange: [0, 2000],
  familyTypes: [],
  petOwnerships: [],
  housingTypes: [],
  digitalLiteracyRange: [1, 5],
  quadrants: [],
  occupations: [],
  regions: [],
};

// ============================================================================
// 人間科学4要素型（記事「ペルソナだけでは人は動かない」より）
// ============================================================================

export interface HumanScienceAnalysis {
  認知: {
    理解していること: string;       // このペルソナが商品について正しく理解していること
    誤解しやすいポイント: string;   // 説明が正確でも頭の中で誤って処理されやすい部分
    難しいと感じる部分: string;     // どこで「わからない・難しい」と感じて離脱するか
  };
  感情: {
    主要感情: string;               // 購買検討中に最も強く感じる感情（不安・焦り・面倒・恥・期待）
    感情が障壁になるシーン: string; // どの感情がどのタイミングで行動を止めるか
    感情を転換するきっかけ: string; // どんな言葉・体験が感情をポジティブに変えるか
  };
  行動: {
    実際の行動パターン: string;     // 「使いたい」と言っても実際にやらない行動と、その理由
    言動のズレ: string;             // アンケートでは「Yes」でも実際にはどこで止まるか
    行動変化のトリガー: string;     // 実際に行動が変わる時、何が起きているか
  };
  身体状態: {
    典型的な使用シーン: string;     // いつ・どこで・どんな状態でこの商品を検討するか
    デバイスと操作環境: string;     // スマホ片手操作・PC集中・電車内・ながら見 等
    集中力と余裕の状態: string;     // 疲れている・時間がない・仕事終わり等、認知資源の状態
  };
}

// ============================================================================
// 動かない理由分析型（非合理な行動阻害要因の構造化）
// ============================================================================

export interface InactionAnalysis {
  損失回避: string;           // 購入で何を失うと感じるか（お金・時間・習慣・面子）
  失敗回避: string;           // 購入後に想像する最悪の失敗シナリオは何か
  承認欲求: string;           // 周囲（家族・同僚・友人）にどう見られることを恐れ、または望むか
  説明コスト: string;         // 誰かに説明・承認してもらう必要があるか（上司・配偶者・親）、その障壁
  初回障壁: string;           // 最初の1ステップで最も面倒・不安なことは何か
  自己認識ギャップ: string;   // 「自分はちゃんとできている」という認識と実際の課題のズレ
}

// ============================================================================
// BIG5 性格診断型
// ============================================================================

export interface ComputedBig5 {
  openness: number;           // 開放性 0-100
  conscientiousness: number;  // 誠実性 0-100
  extraversion: number;       // 外向性 0-100
  agreeableness: number;      // 協調性 0-100
  neuroticism: number;        // 神経症傾向 0-100
}

export interface Big5Profile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
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
  "人間科学4要素": HumanScienceAnalysis;
  "動かない理由分析": InactionAnalysis;
  "5Big診断": ComputedBig5;
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
// Web Worker 通信型
// ============================================================================

export interface SimulationWorkerRequest {
  productData: ProductInfo;
  sliderParams: SliderParameters;
  populationSize: number;
}

export interface SimulationWorkerResponse {
  type: 'progress' | 'complete' | 'error';
  progress?: number;
  result?: SimulationResult;
  error?: string;
}
