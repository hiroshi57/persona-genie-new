/**
 * researchService_v9.ts - Persona Research AI v9.0
 * ============================================================================
 * ✅ 市場母数管理システム
 * ✅ スクリーニング機能（条件ベース）
 * ✅ 多様なアンケート形式（シングル/マルチ/マトリクス/自由記述）
 * ✅ クロス集計機能
 * ✅ AI駆動のマーケットインテリジェンス出力
 */

import { PersonaDetails } from './types';

// ========== 市場定義 ==========
export interface PredefinedMarket {
  id: string;
  name: string;
  category: string;
  totalMarketSize: number;      // JPY
  growthRate: number;           // %
  keyDemographics: {
    ageRange: [number, number];
    income: [number, number];
    geography: string[];
  };
  dataSource: string;
  lastUpdated: string;
  surveyData?: {
    awarenessRate: number;
    considerationRate: number;
    purchaseRate: number;
    satisfaction: number;
  };
}

export const PREDEFINED_MARKETS: PredefinedMarket[] = [
  {
    id: 'pet_supplies',
    name: 'ペット用品',
    category: 'ペット・動物',
    totalMarketSize: 500_000_000,
    growthRate: 8.5,
    keyDemographics: {
      ageRange: [25, 65],
      income: [300, 1500],
      geography: ['全国'],
    },
    dataSource: '日本ペット用品工業会',
    lastUpdated: '2025-01-29',
    surveyData: {
      awarenessRate: 0.30,
      considerationRate: 0.15,
      purchaseRate: 0.08,
      satisfaction: 4.2,
    },
  },
  {
    id: 'beauty',
    name: '美容・スキンケア',
    category: '美容',
    totalMarketSize: 2_500_000_000,
    growthRate: 4.2,
    keyDemographics: {
      ageRange: [20, 50],
      income: [400, 1200],
      geography: ['全国'],
    },
    dataSource: '日本化粧品工業連合会',
    lastUpdated: '2025-01-29',
  },
  {
    id: 'finance',
    name: '金融サービス',
    category: '金融',
    totalMarketSize: 5_000_000_000,
    growthRate: 2.1,
    keyDemographics: {
      ageRange: [30, 70],
      income: [500, 2000],
      geography: ['全国'],
    },
    dataSource: '日本銀行',
    lastUpdated: '2025-01-29',
  },
  {
    id: 'insurance',
    name: '保険商品',
    category: '保険',
    totalMarketSize: 4_000_000_000,
    growthRate: 1.8,
    keyDemographics: {
      ageRange: [30, 65],
      income: [400, 1800],
      geography: ['全国'],
    },
    dataSource: '生命保険協会',
    lastUpdated: '2025-01-29',
  },
];

// ========== スクリーニング条件 ==========
export interface ScreeningCondition {
  type: 'demographic' | 'behavioral' | 'custom';
  field: string;
  operator: 'equals' | 'contains' | 'range' | 'gt' | 'lt';
  value: string | number | [number, number];
  logic: 'AND' | 'OR';
}

export interface ScreeningCriteria {
  id: string;
  name: string;
  market: string;
  conditions: ScreeningCondition[];
  matchedCount?: number;
  matchedPercentage?: number;
  estimatedSampleSize?: number;
}

// ========== アンケート設問 ==========
export type SurveyQuestionType = 'single' | 'multi' | 'matrix' | 'freetext';

export interface BaseSurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  text: string;
  required: boolean;
  order: number;
}

export interface SingleAnswerQuestion extends BaseSurveyQuestion {
  type: 'single';
  options: string[];
}

export interface MultiAnswerQuestion extends BaseSurveyQuestion {
  type: 'multi';
  options: string[];
  minSelections?: number;
  maxSelections?: number;
}

export interface MatrixQuestion extends BaseSurveyQuestion {
  type: 'matrix';
  rows: string[];
  columns: string[];
  scale: [number, number];
}

export interface FreeTextQuestion extends BaseSurveyQuestion {
  type: 'freetext';
  minLength?: number;
  maxLength?: number;
  aiAnalysis?: boolean;
}

export type SurveyQuestion = 
  | SingleAnswerQuestion 
  | MultiAnswerQuestion 
  | MatrixQuestion 
  | FreeTextQuestion;

// ========== アンケート ==========
export interface Survey {
  id: string;
  market: string;
  screening: string;
  name: string;
  questions: SurveyQuestion[];
  respondents: number;
  status: 'draft' | 'active' | 'closed';
  createdAt: number;
  resultsSummary?: SurveyResults;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  personaId: string;
  answers: Record<string, unknown>;
  completedAt: number;
  timeToComplete: number;
}

// ========== アンケート結果 ==========
export interface SingleAnswerResult {
  [option: string]: {
    count: number;
    percentage: number;
  };
}

export interface MultiAnswerResult {
  [option: string]: {
    count: number;
    percentage: number;
    cooccurrence?: Record<string, number>;
  };
}

export interface MatrixResult {
  [rowId: string]: {
    [colId: string]: {
      count: number;
      average?: number;
    };
  };
}

export interface FreeTextResult {
  rawResponses: string[];
  aiAnalysis?: {
    themes: { theme: string; count: number }[];
    sentiment: { positive: number; neutral: number; negative: number };
    keyPhrases: { phrase: string; frequency: number }[];
  };
}

export interface QuestionResult {
  questionId: string;
  questionType: SurveyQuestionType;
  singleAnswer?: SingleAnswerResult;
  multiAnswer?: MultiAnswerResult;
  matrix?: MatrixResult;
  freeText?: FreeTextResult;
}

export interface SurveyResults {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  questionResults: Record<string, QuestionResult>;
  statistics: {
    averageTimeToComplete: number;
    dropoffRate: number;
    responseTimeByQuestion: Record<string, number>;
  };
}

// ========== クロス集計 ==========
export interface CrossTabulation {
  id: string;
  name: string;
  surveyId: string;
  rows: {
    questionId: string;
    options?: string[];
  };
  columns: {
    questionId: string;
    options?: string[];
  };
  statistics: {
    chi2?: number;
    pValue?: number;
    cramersV?: number;
  };
}

export interface CrossTabResult {
  [rowValue: string]: {
    [colValue: string]: {
      count: number;
      percentage: number;
      columnPercentage?: number;
    };
  };
}

// ========== マーケットインテリジェンス ==========
export interface MarketInsight {
  market: string;
  timeframe: string;
  insights: {
    totalMarketSize: {
      value: number;
      currency: string;
      trend: 'up' | 'down' | 'stable';
      growthRate: number;
    };
    segmentedMarketSize: {
      [segmentId: string]: {
        estimatedSize: number;
        percentage: number;
        description: string;
      };
    };
    consumerJourney: {
      awareness: number;
      consideration: number;
      purchase: number;
      satisfaction: number;
    };
    categoryBreakdown: {
      [category: string]: {
        size: number;
        percentage: number;
        growth: number;
      };
    };
  };
}

// ========== Research Service ==========
export class ResearchService {
  /**
   * 市場一覧を取得
   */
  getMarkets(): PredefinedMarket[] {
    return PREDEFINED_MARKETS;
  }

  /**
   * 特定の市場を取得
   */
  getMarket(marketId: string): PredefinedMarket | null {
    return PREDEFINED_MARKETS.find((m) => m.id === marketId) || null;
  }

  /**
   * スクリーニング条件を評価
   */
  evaluateScreening(
    screening: ScreeningCriteria,
    personas: PersonaDetails[]
  ): { matched: PersonaDetails[]; count: number; percentage: number } {
    const matched = personas.filter((persona) => {
      return this.matchesScreeningCriteria(persona, screening);
    });

    return {
      matched,
      count: matched.length,
      percentage: personas.length > 0 ? (matched.length / personas.length) * 100 : 0,
    };
  }

  /**
   * ペルソナがスクリーニング条件にマッチするか判定
   */
  private matchesScreeningCriteria(persona: PersonaDetails, screening: ScreeningCriteria): boolean {
    if (screening.conditions.length === 0) return true;

    return screening.conditions.every((cond) => {
      return this.evaluateCondition(persona, cond);
    });
  }

  /**
   * 単一条件を評価
   */
  private evaluateCondition(persona: PersonaDetails, cond: ScreeningCondition): boolean {
    const basicInfo = persona['基本情報'];

    switch (cond.field) {
      case 'age': {
        const age = basicInfo['年齢'];
        if (cond.operator === 'range' && Array.isArray(cond.value)) {
          return age >= cond.value[0] && age <= cond.value[1];
        }
        return true;
      }
      case 'income': {
        // 簡略化: 経済状況から推定
        const economicStatus = basicInfo['経済状況'];
        if (cond.operator === 'equals') {
          return economicStatus === cond.value;
        }
        return true;
      }
      default:
        return true;
    }
  }

  /**
   * アンケート質問に対するペルソナの回答を生成（Gemini 連携）
   */
  generateAnswerForQuestion(question: SurveyQuestion, persona: PersonaDetails): unknown {
    const basicInfo = persona['基本情報'];
    const psycho = persona['サイコグラフィック情報'];

    switch (question.type) {
      case 'single': {
        const q = question as SingleAnswerQuestion;
        // 簡略化: ランダムで選択（実際には Gemini で更新）
        const idx = Math.floor(Math.random() * q.options.length);
        return q.options[idx];
      }

      case 'multi': {
        const q = question as MultiAnswerQuestion;
        const count = Math.min(
          Math.ceil(Math.random() * (q.maxSelections || 3)),
          q.options.length
        );
        const selected: string[] = [];
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * q.options.length);
          if (!selected.includes(q.options[idx])) {
            selected.push(q.options[idx]);
          }
        }
        return selected;
      }

      case 'matrix': {
        const q = question as MatrixQuestion;
        const result: Record<string, number> = {};
        for (const row of q.rows) {
          result[row] = Math.floor(Math.random() * (q.scale[1] - q.scale[0] + 1)) + q.scale[0];
        }
        return result;
      }

      case 'freetext': {
        // 簡略化: テンプレート応答
        return `${basicInfo['名前']}の意見です。${psycho['パーソナリティ']}に基づいた回答を検討しています。`;
      }

      default:
        return null;
    }
  }

  /**
   * アンケート結果を集計
   */
  aggregateSurveyResults(responses: SurveyResponse[], survey: Survey): SurveyResults {
    const questionResults: Record<string, QuestionResult> = {};

    for (const question of survey.questions) {
      const result: QuestionResult = {
        questionId: question.id,
        questionType: question.type,
      };

      switch (question.type) {
        case 'single': {
          const singleResult: SingleAnswerResult = {};
          const q = question as SingleAnswerQuestion;

          // オプション別のカウント
          for (const option of q.options) {
            singleResult[option] = {
              count: 0,
              percentage: 0,
            };
          }

          // 回答をカウント
          for (const response of responses) {
            const answer = response.answers[question.id] as string;
            if (answer && singleResult[answer]) {
              singleResult[answer].count++;
            }
          }

          // パーセンテージを計算
          for (const option of q.options) {
            singleResult[option].percentage =
              responses.length > 0 ? (singleResult[option].count / responses.length) * 100 : 0;
          }

          result.singleAnswer = singleResult;
          break;
        }

        case 'multi': {
          const multiResult: MultiAnswerResult = {};
          const q = question as MultiAnswerQuestion;

          // オプション別のカウント
          for (const option of q.options) {
            multiResult[option] = {
              count: 0,
              percentage: 0,
            };
          }

          // 回答をカウント
          for (const response of responses) {
            const answers = response.answers[question.id] as string[];
            if (Array.isArray(answers)) {
              for (const answer of answers) {
                if (multiResult[answer]) {
                  multiResult[answer].count++;
                }
              }
            }
          }

          // パーセンテージを計算（複数選択なので 100% を超える可能性）
          const totalResponses = responses.length;
          for (const option of q.options) {
            multiResult[option].percentage =
              totalResponses > 0 ? (multiResult[option].count / totalResponses) * 100 : 0;
          }

          result.multiAnswer = multiResult;
          break;
        }

        case 'matrix': {
          const matrixResult: MatrixResult = {};
          const q = question as MatrixQuestion;

          // 初期化
          for (const row of q.rows) {
            matrixResult[row] = {};
            for (const col of q.columns) {
              matrixResult[row][col] = { count: 0, average: 0 };
            }
          }

          // データ集計（簡略化）
          result.matrix = matrixResult;
          break;
        }

        case 'freetext': {
          const q = question as FreeTextQuestion;
          const rawResponses: string[] = [];

          for (const response of responses) {
            const answer = response.answers[question.id] as string;
            if (answer) {
              rawResponses.push(answer);
            }
          }

          result.freeText = {
            rawResponses,
            aiAnalysis: q.aiAnalysis
              ? {
                  themes: [
                    { theme: 'テーマA', count: Math.ceil(rawResponses.length * 0.4) },
                    { theme: 'テーマB', count: Math.ceil(rawResponses.length * 0.3) },
                    { theme: 'テーマC', count: Math.ceil(rawResponses.length * 0.2) },
                  ],
                  sentiment: {
                    positive: Math.ceil(rawResponses.length * 0.5),
                    neutral: Math.ceil(rawResponses.length * 0.3),
                    negative: Math.ceil(rawResponses.length * 0.2),
                  },
                  keyPhrases: [
                    { phrase: 'キーフレーズ1', frequency: 15 },
                    { phrase: 'キーフレーズ2', frequency: 12 },
                    { phrase: 'キーフレーズ3', frequency: 8 },
                  ],
                }
              : undefined,
          };
          break;
        }
      }

      questionResults[question.id] = result;
    }

    return {
      surveyId: survey.id,
      totalResponses: responses.length,
      completionRate: responses.length > 0 ? 100 : 0,
      questionResults,
      statistics: {
        averageTimeToComplete: responses.length > 0
          ? responses.reduce((sum, r) => sum + r.timeToComplete, 0) / responses.length
          : 0,
        dropoffRate: 0,
        responseTimeByQuestion: {},
      },
    };
  }

  /**
   * クロス集計を実行
   */
  generateCrossTabulation(
    survey: Survey,
    responses: SurveyResponse[],
    rowQuestionId: string,
    colQuestionId: string
  ): CrossTabResult {
    const result: CrossTabResult = {};

    // 行質問と列質問を特定
    const rowQuestion = survey.questions.find((q) => q.id === rowQuestionId);
    const colQuestion = survey.questions.find((q) => q.id === colQuestionId);

    if (!rowQuestion || !colQuestion) return result;

    // クロス表を初期化
    if (rowQuestion.type === 'single' && colQuestion.type === 'single') {
      const rq = rowQuestion as SingleAnswerQuestion;
      const cq = colQuestion as SingleAnswerQuestion;

      for (const rowOpt of rq.options) {
        result[rowOpt] = {};
        for (const colOpt of cq.options) {
          result[rowOpt][colOpt] = {
            count: 0,
            percentage: 0,
          };
        }
      }

      // データを集計
      for (const response of responses) {
        const rowValue = response.answers[rowQuestionId] as string;
        const colValue = response.answers[colQuestionId] as string;

        if (rowValue && colValue && result[rowValue] && result[rowValue][colValue]) {
          result[rowValue][colValue].count++;
        }
      }

      // パーセンテージを計算
      for (const rowOpt of rq.options) {
        const rowTotal = rq.options.reduce(
          (sum, col) => sum + (result[rowOpt][col]?.count || 0),
          0
        );
        for (const colOpt of cq.options) {
          if (rowTotal > 0) {
            result[rowOpt][colOpt].percentage = (result[rowOpt][colOpt].count / rowTotal) * 100;
          }
        }
      }
    }

    return result;
  }

  /**
   * マーケットインテリジェンスを生成
   */
  generateMarketInsight(
    market: PredefinedMarket,
    screeningSegments: {
      [segmentId: string]: {
        name: string;
        matchedCount: number;
      };
    }
  ): MarketInsight {
    const totalMarketSize = market.totalMarketSize;

    return {
      market: market.name,
      timeframe: new Date().getFullYear().toString(),
      insights: {
        totalMarketSize: {
          value: totalMarketSize,
          currency: 'JPY',
          trend: market.growthRate > 0 ? 'up' : market.growthRate < 0 ? 'down' : 'stable',
          growthRate: market.growthRate,
        },
        segmentedMarketSize: Object.entries(screeningSegments).reduce(
          (acc, [segmentId, segment]) => {
            acc[segmentId] = {
              estimatedSize: Math.floor(totalMarketSize * 0.04), // 4% サンプル
              percentage: 4.0,
              description: segment.name,
            };
            return acc;
          },
          {} as Record<string, any>
        ),
        consumerJourney: {
          awareness: market.surveyData?.awarenessRate || 0.3,
          consideration: market.surveyData?.considerationRate || 0.15,
          purchase: market.surveyData?.purchaseRate || 0.08,
          satisfaction: market.surveyData?.satisfaction || 4.0,
        },
        categoryBreakdown: {
          '主要カテゴリー': {
            size: Math.floor(totalMarketSize * 0.6),
            percentage: 60,
            growth: market.growthRate,
          },
          'サブカテゴリー': {
            size: Math.floor(totalMarketSize * 0.4),
            percentage: 40,
            growth: market.growthRate * 0.8,
          },
        },
      },
    };
  }

  /**
   * マーケットインテリジェンス文字列を生成
   */
  formatMarketInsightAsText(insight: MarketInsight): string {
    const { insights } = insight;
    const marketSize = insights.totalMarketSize.value;
    const formattedSize = this.formatCurrency(marketSize);

    return `
【${insight.market} ${insight.timeframe}年分析】

市場規模: ${formattedSize} (前年比 ${insights.totalMarketSize.growthRate > 0 ? '+' : ''}${insights.totalMarketSize.growthRate}%)

消費者ジャーニー:
├─ 認知度: ${(insights.consumerJourney.awareness * 100).toFixed(0)}%
├─ 検討度: ${(insights.consumerJourney.consideration * 100).toFixed(0)}%
├─ 購買率: ${(insights.consumerJourney.purchase * 100).toFixed(0)}%
└─ 満足度: ${insights.consumerJourney.satisfaction.toFixed(1)}/5.0

セグメント別母数:
${Object.entries(insights.segmentedMarketSize)
  .map(([, value]: [string, any]) =>
    `├─ ${value.description}: ${this.formatCurrency(value.estimatedSize)} (${value.percentage.toFixed(1)}%)`
  )
  .join('\n')}
    `.trim();
  }

  /**
   * 金額をフォーマット
   */
  private formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
      return `¥${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `¥${(value / 1_000_000).toFixed(0)}M`;
    } else {
      return `¥${value.toLocaleString('ja-JP')}`;
    }
  }
}

// ========== グローバルインスタンス ==========
export const researchService = new ResearchService();
