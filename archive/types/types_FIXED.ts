/**
 * types_FIXED.ts - 完全型安全版（any型 0個）
 * ✅ すべての型を明示的に定義
 * ✅ Union types で複数パターンに対応
 * ✅ Generics で再利用性向上
 */

// ============================================================================
// 基本的な商品情報
// ============================================================================
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

// ============================================================================
// AIDMA分析（5段階）
// ============================================================================
export interface AIDMAAnalysis {
  認知: string;
  興味: string;
  欲求: string;
  記憶: string;
  行動: string;
}

// ============================================================================
// カスタマージャーニー（4段階）
// ============================================================================
export interface JourneyStage {
  段階: string;
  状況: string;
  心理状態: string;
  行動: string;
  タッチポイント: string;
}

export interface CustomerJourney {
  認知段階: JourneyStage;
  検討段階: JourneyStage;
  決定段階: JourneyStage;
  購入段階: JourneyStage;
}

// ============================================================================
// PDCA施策
// ============================================================================
export interface PDCACycle {
  Plan: string;
  Do: string;
  Check: string;
  Action: string;
}

// ============================================================================
// 心理転換点（複数トリガー）
// ============================================================================
export interface PsychologicalTrigger {
  トリガー: string;
  発生場面: string;
  心理的変化: string;
}

// ============================================================================
// データソース（100%検証済み）
// ============================================================================
export interface DataSource {
  '1次データソース': string;
  '2次データソース': string;
  信頼性スコア: 100;
  データ根拠: string;
}

// ============================================================================
// ペルソナ詳細（完全統合版）
// ============================================================================
export interface BasicInfo {
  名前: string;
  年齢: string;
  性別: string;
  職業: string;
  経済状況: string;
  教育レベル: string;
  家族構成: string;
  居住地: string;
}

export interface DemographicInfo {
  宗教: string;
  文化背景: string;
  使用言語: string;
}

export interface PsychographicInfo {
  ライフスタイル: string;
  価値観: string;
  趣味・興味: string;
  パーソナリティ: string;
}

export interface BehaviorInfo {
  購買行動の癖: string;
  情報収集方法: string;
  使用デバイス: string;
  よく使うメディア: string;
}

export interface MotivationInfo {
  短期欲求: string;
  長期欲求: string;
  動機: string;
}

export interface PainPointInfo {
  '現在の課題、悩み': string;
  不満点: string;
  障壁: string;
}

export interface DecisionProcess {
  '意思決定の流れ': string;
  '影響を受けやすい要因': string;
  '購入決定に関与する人物': string;
}

export interface PersonaDetails {
  基本情報: BasicInfo;
  デモグラフィック情報: DemographicInfo;
  サイコグラフィック情報: PsychographicInfo;
  行動情報: BehaviorInfo;
  目標動機欲求: MotivationInfo;
  課題ペインポイント: PainPointInfo;
  意思決定プロセス: DecisionProcess;
  購入理由: string;
  AIDMA分析: AIDMAAnalysis;
  カスタマージャーニー: CustomerJourney;
  PDCA施策: PDCACycle;
  心理転換点: PsychologicalTrigger[];
  データソース: DataSource;
}

export interface PersonaResponse {
  ペルソナA: PersonaDetails;
  ペルソナB: PersonaDetails;
  ペルソナC: PersonaDetails;
}

// ============================================================================
// UI状態管理（完全型定義）
// ============================================================================
export type UIPhase = 'input' | 'analysis' | 'results';
export type ActiveTab =
  | 'basic'
  | 'aidma'
  | 'journey'
  | 'pdca'
  | 'psychology'
  | 'datasource';
export type ActivePersona = 'A' | 'B' | 'C';
export type ErrorLevel = 'info' | 'warning' | 'error';

export interface UIError {
  level: ErrorLevel;
  message: string;
  timestamp: number;
  code?: string;
}

export interface UIState {
  phase: UIPhase;
  activeTab: ActiveTab;
  activePersona: ActivePersona;
  isLoading: boolean;
  error: UIError | null;
  successMessage: string | null;
  isDarkMode: boolean;
}

// ============================================================================
// セッション管理（新機能）
// ============================================================================
export interface SessionData {
  id: string;
  timestamp: number;
  productData: ProductInfo;
  personas: PersonaResponse;
  notes: string;
  tags: string[];
}

export interface SessionHistory {
  sessions: SessionData[];
  currentSessionId: string | null;
}

// ============================================================================
// エクスポート形式（新機能）
// ============================================================================
export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeAnalysis: boolean;
  includeInterviews: boolean;
  includeDataSources: boolean;
}

// ============================================================================
// ペルソナ比較（新機能）
// ============================================================================
export interface ComparisonMetric {
  metric: string;
  personaA: string;
  personaB: string;
  personaC: string;
  difference: string;
}

export interface PersonaComparison {
  compareBy: 'motivation' | 'painpoint' | 'demographic';
  metrics: ComparisonMetric[];
}

// ============================================================================
// API レスポンス型（エラーハンドリング強化）
// ============================================================================
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details: string;
  } | null;
  timestamp: number;
}

export interface APIErrorResponse {
  code: 'VALIDATION_ERROR' | 'API_ERROR' | 'TIMEOUT_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details: Record<string, string>;
}

// ============================================================================
// イベント型（ユーザー操作）
// ============================================================================
export type FormEventType = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
export type ClickEventType = React.MouseEvent<HTMLButtonElement>;
export type SubmitEventType = React.FormEvent<HTMLFormElement>;

// ============================================================================
// ユーティリティ型
// ============================================================================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MaybePromise<T> = T | Promise<T>;

export type AsyncFunction<T> = () => Promise<T>;
export type AsyncCallback<T, R> = (data: T) => Promise<R>;

// ============================================================================
// 定数・デフォルト値
// ============================================================================
export const DEFAULT_PRODUCT_INFO: ProductInfo = {
  productName: '',
  category: '',
  releaseDate: '',
  price: '',
  salesChannels: '',
  features: { appearance: '', function: '', concept: '' },
  customerHypothesis: '',
  valueProposition: { assumedNeeds: '', solutionHypothesis: '' },
};

export const DEFAULT_UI_STATE: UIState = {
  phase: 'input',
  activeTab: 'basic',
  activePersona: 'A',
  isLoading: false,
  error: null,
  successMessage: null,
  isDarkMode: false,
};

// ============================================================================
// バリデーションルール
// ============================================================================
export const VALIDATION_RULES = {
  productName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9ぁ-んァ-ヴー一-龠〆〤\s\-\(\)！！？。、，]+$/,
    errorMessage: '商品名は1～100文字の日本語または英数字で入力してください',
  },
  category: {
    minLength: 1,
    maxLength: 50,
    errorMessage: 'カテゴリーは1～50文字で入力してください',
  },
  price: {
    pattern: /^[0-9,¥€$\s]*$/,
    errorMessage: '価格は数字と通貨記号のみで入力してください',
  },
} as const;

// ============================================================================
// UIテキスト定義（国際化対応）
// ============================================================================
export const UI_MESSAGES = {
  ja: {
    errors: {
      validationError: '入力値が正しくありません',
      apiError: 'APIエラーが発生しました',
      networkError: 'ネットワークエラーが発生しました',
      timeoutError: 'リクエストがタイムアウトしました',
      unknownError: '不明なエラーが発生しました',
    },
    success: {
      saved: 'セッションを保存しました',
      exported: 'ファイルをエクスポートしました',
      generated: 'ペルソナを生成しました',
    },
    labels: {
      productName: '商品名',
      category: 'カテゴリー',
      analysis: '分析',
      export: 'エクスポート',
      save: '保存',
      reset: 'リセット',
    },
  },
} as const;

// ============================================================================
// ガード関数（型安全性）
// ============================================================================
export const isValidProductInfo = (data: unknown): data is ProductInfo => {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.productName === 'string' &&
    typeof obj.category === 'string' &&
    obj.productName.length > 0 &&
    obj.category.length > 0
  );
};

export const isValidPersonaResponse = (data: unknown): data is PersonaResponse => {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    'ペルソナA' in obj &&
    'ペルソナB' in obj &&
    'ペルソナC' in obj
  );
};

export const isUIPhase = (value: unknown): value is UIPhase => {
  return value === 'input' || value === 'analysis' || value === 'results';
};

export const isActiveTab = (value: unknown): value is ActiveTab => {
  return (
    value === 'basic' ||
    value === 'aidma' ||
    value === 'journey' ||
    value === 'pdca' ||
    value === 'psychology' ||
    value === 'datasource'
  );
};
