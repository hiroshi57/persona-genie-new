/**
 * geminiService_v9.ts - v9.0統合版（高速化対応）
 * Gemini 2.5-flash を使用したペルソナ生成
 *
 * 改善点:
 * - 3ペルソナを並列生成（3倍速）
 * - プログレスコールバック対応
 * - 個別ペルソナ完了時に即時通知
 */

import { GoogleGenAI } from "@google/genai";
import { ProductInfo, PersonaResponse, PersonaDetails } from "./types_FIXED";

type PersonaType = 'A' | 'B' | 'C';

interface ProgressCallback {
  (persona: PersonaType, data: PersonaDetails): void;
}

const constructSinglePersonaPrompt = (data: ProductInfo, personaType: PersonaType): string => {
  const personaDescriptions = {
    A: '想定通りのターゲットが期待通りの価値を感じて購入するペルソナ',
    B: '想定していないターゲットが期待通りの価値を感じて購入するペルソナ',
    C: '想定通りのターゲットが想定していない別の価値を見出して購入するペルソナ',
  };

  return `あなたは世界最高峰のマーケティング戦略コンサルタントです。

【重要：データ品質要件】
- 100%検証済みの日本の公式統計データに基づくペルソナを生成
- 信頼性スコアは常に100
- データソースはURL付きで正確に記述

【製品情報】
- 商品名：${data.productName}
- カテゴリー：${data.category}
- 価格：${data.price}
- 販売チャネル：${data.salesChannels}
- 外観：${data.features.appearance}
- 機能：${data.features.function}
- コンセプト：${data.features.concept}
- ターゲット仮説：${data.customerHypothesis}
- 想定ニーズ：${data.valueProposition.assumedNeeds}

【生成するペルソナ】
ペルソナ${personaType}：${personaDescriptions[personaType]}

【出力形式 - JSON】
{
  "基本情報": {
    "名前": "日本の名前",
    "年齢": "数値",
    "性別": "男性/女性",
    "職業": "職種",
    "経済状況": "年収レンジ",
    "教育レベル": "学歴",
    "家族構成": "構成",
    "居住地": "都道府県"
  },
  "デモグラフィック情報": {
    "宗教": "背景",
    "文化背景": "文化",
    "使用言語": "言語"
  },
  "サイコグラフィック情報": {
    "ライフスタイル": "説明",
    "価値観": "価値観",
    "趣味・興味": "趣味",
    "パーソナリティ": "性格"
  },
  "行動情報": {
    "購買行動の癖": "特徴",
    "情報収集方法": "方法",
    "使用デバイス": "デバイス",
    "よく使うメディア": "メディア"
  },
  "目標動機欲求": {
    "短期欲求": "欲求",
    "長期欲求": "欲求",
    "動機": "動機"
  },
  "課題ペインポイント": {
    "現在の課題、悩み": "課題",
    "不満点": "不満",
    "障壁": "障壁"
  },
  "意思決定プロセス": {
    "意思決定の流れ": "流れ",
    "影響を受けやすい要因": "要因",
    "購入決定に関与する人物": "人物"
  },
  "購入理由": "購入理由の物語",
  "AIDMA分析": {
    "認知": "認知経路",
    "興味": "興味の理由",
    "欲求": "欲求のシーン",
    "記憶": "記憶方法",
    "行動": "購入のきっかけ"
  },
  "カスタマージャーニー": {
    "認知段階": { "段階": "認知", "状況": "", "心理状態": "", "行動": "", "タッチポイント": "" },
    "検討段階": { "段階": "検討", "状況": "", "心理状態": "", "行動": "", "タッチポイント": "" },
    "決定段階": { "段階": "決定", "状況": "", "心理状態": "", "行動": "", "タッチポイント": "" },
    "購入段階": { "段階": "購入", "状況": "", "心理状態": "", "行動": "", "タッチポイント": "" }
  },
  "PDCA施策": {
    "Plan": "計画",
    "Do": "実行",
    "Check": "測定",
    "Action": "改善"
  },
  "心理転換点": [
    { "トリガー": "", "発生場面": "", "心理的変化": "" },
    { "トリガー": "", "発生場面": "", "心理的変化": "" },
    { "トリガー": "", "発生場面": "", "心理的変化": "" }
  ],
  "データソース": {
    "1次データソース": "総務省統計 https://www.stat.go.jp/ など",
    "2次データソース": "日本銀行 https://www.boj.or.jp/ など",
    "信頼性スコア": 100,
    "データ根拠": "根拠説明"
  }
}`;
};

const generateSinglePersona = async (
  ai: GoogleGenAI,
  productData: ProductInfo,
  personaType: PersonaType
): Promise<PersonaDetails> => {
  const prompt = constructSinglePersonaPrompt(productData, personaType);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) {
    throw new Error(`No response for Persona ${personaType}`);
  }

  return JSON.parse(response.text) as PersonaDetails;
};

/**
 * 3ペルソナを並列生成（高速版）
 * @param productData 製品情報
 * @param onProgress 各ペルソナ完了時のコールバック（オプション）
 */
export const generatePersonas = async (
  productData: ProductInfo,
  onProgress?: ProgressCallback
): Promise<PersonaResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const personaTypes: PersonaType[] = ['A', 'B', 'C'];

  // 並列実行
  const results = await Promise.all(
    personaTypes.map(async (type) => {
      const persona = await generateSinglePersona(ai, productData, type);
      if (onProgress) {
        onProgress(type, persona);
      }
      return { type, persona };
    })
  );

  // 結果を PersonaResponse 形式に変換
  const response: PersonaResponse = {
    'ペルソナA': results.find(r => r.type === 'A')!.persona,
    'ペルソナB': results.find(r => r.type === 'B')!.persona,
    'ペルソナC': results.find(r => r.type === 'C')!.persona,
  };

  return response;
};

/**
 * 単一ペルソナ生成（デバッグ・テスト用）
 */
export const generateSinglePersonaOnly = async (
  productData: ProductInfo,
  personaType: PersonaType
): Promise<PersonaDetails> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return generateSinglePersona(ai, productData, personaType);
};
