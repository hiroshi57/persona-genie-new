/**
 * claudeService-improved.ts
 * 改善版：5Big診断を含むペルソナ生成 + 自動データソース統合
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PersonaDetails, BigFiveTraits } from "./types-extended";
import { getDataSourcesForPersona, BIG_FIVE_STANDARDS } from "./datasources";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

const constructEnhancedPrompt = (
  personaRepresentative: {
    age: number;
    income: number;
    recognitionScore: number;
    purchaseIntent: number;
    region: string;
  },
  quadrant: "Q1" | "Q2" | "Q3" | "Q4",
  productData: {
    productName: string;
    category: string;
    price: string;
  },
  personaLetter: "A" | "B" | "C"
): string => {
  const quadrantDescriptions = {
    "Q1": "高認知度×高購買意欲 - 優先顧客層",
    "Q2": "低認知度×高購買意欲 - 将来顧客層",
    "Q3": "低認知度×低購買意欲 - 開拓対象層",
    "Q4": "高認知度×低購買意欲 - 見直し対象層",
  };

  return `
あなたは日本有数のマーケティング戦略コンサルタントです。
統計データに基づき、確認可能な事実からのみペルソナを構築してください。

【商品情報】
- 商品名：${productData.productName}
- カテゴリー：${productData.category}
- 価格帯：${productData.price}

【ペルソナ属性（シミュレーションベース）】
- ペルソナ${personaLetter}：${quadrantDescriptions[quadrant]}
- 代表年齢：${personaRepresentative.age}歳
- 代表年収：¥${personaRepresentative.income}万
- 認知度スコア：${personaRepresentative.recognitionScore}/100
- 購買意欲スコア：${personaRepresentative.purchaseIntent}/100
- 主要地域：${personaRepresentative.region}

【出力形式 - 必ずJSON形式のみで出力】

以下のスキーマに従い、すべてのフィールドを埋めてください。
データソース、Big Five診断、すべての分析を含めること。

{
  "基本情報": {
    "名前": "実在の日本人名（様式：太郎、花子など）",
    "年齢": ${personaRepresentative.age},
    "性別": "男性" または "女性",
    "職業": "実際に存在する職業",
    "経済状況": "低、中、高のいずれか",
    "教育レベル": "中卒、高卒、大卒など",
    "家族構成": "実在する家族パターン",
    "居住地": "${personaRepresentative.region}都道府県内の都市"
  },
  
  "デモグラフィック情報": {
    "宗教": "日本の一般的な宗教観",
    "文化背景": "日本",
    "使用言語": "日本語"
  },
  
  "サイコグラフィック情報": {
    "ライフスタイル": "このペルソナの日常生活パターン",
    "価値観": "重視する人生価値",
    "趣味・興味": "実際に行われている趣味活動",
    "パーソナリティ": "性格特性の簡潔な説明"
  },
  
  "行動情報": {
    "購買行動の癖": "この年代・職業の典型的な買い物スタイル",
    "情報収集方法": "実際に使用しているメディア・チャネル",
    "使用デバイス": "PC、スマートフォン、タブレットなど",
    "よく使うメディア": "実際の利用メディア（テレビ、SNS等）"
  },
  
  "目標動機欲求": {
    "短期欲求": "今すぐ欲しいこと（1ヶ月以内）",
    "長期欲求": "長期的な理想（1年以上）",
    "動機": "購入に至る根本的な動機"
  },
  
  "課題ペインポイント": {
    "現在の課題、悩み": "現在の主な問題点",
    "不満点": "既存製品・サービスへの不満",
    "障壁": "購買時の障壁となる要因"
  },
  
  "意思決定プロセス": {
    "意思決定の流れ": "購入までの決定プロセス",
    "影響を受けやすい要因": "購入判断に影響する要素",
    "購入決定に関与する人物": "購入決定に関わる人物"
  },
  
  "購入理由": "このペルソナが当該製品を購入する具体的なストーリー（最大100字）",
  
  "AIDMA分析": {
    "認知": "どのタッチポイントで認知するか",
    "興味": "認知から興味への遷移理由",
    "欲求": "欲求を感じるシーン",
    "記憶": "購入前の記憶プロセス",
    "行動": "購入に至る行動"
  },
  
  "カスタマージャーニー": {
    "認知段階": {
      "段階": "認知",
      "状況": "このペルソナが問題に気づく状況",
      "心理状態": "その時の感情・心理状態",
      "行動": "具体的な行動",
      "タッチポイント": "接触するメディア・場所"
    },
    "検討段階": {
      "段階": "検討",
      "状況": "複数選択肢を比較する状況",
      "心理状態": "比較検討時の心理",
      "行動": "比較検討の具体的行動",
      "タッチポイント": "レビューサイト、SNS等"
    },
    "決定段階": {
      "段階": "決定",
      "状況": "購入決定の直前",
      "心理状態": "最終判断時の心理",
      "行動": "最終確認や検討行動",
      "タッチポイント": "ECサイト、メールマガジン等"
    },
    "購入段階": {
      "段階": "購入",
      "状況": "実際に購入する瞬間",
      "心理状態": "購入時の心理（期待、不安等）",
      "行動": "決済処理等の具体的行動",
      "タッチポイント": "ECサイトのチェックアウト画面等"
    }
  },
  
  "PDCA施策": {
    "Plan": "このペルソナに対する施策計画",
    "Do": "実行する具体的な施策",
    "Check": "効果測定方法と目標指標",
    "Action": "測定結果に基づく改善施策"
  },
  
  "心理転換点": [
    {
      "トリガー": "心理転換のきっかけ（具体的イベント）",
      "発生場面": "いつ、どこで、何が起きたか",
      "心理的変化": "心理状態の変化フロー（例：不安→信頼→購買欲）"
    }
  ],
  
  "5Big診断": {
    "開放性": {
      "スコア": 0-100の数値,
      "説明": "このペルソナの開放性の特性と購買行動への影響"
    },
    "誠実性": {
      "スコア": 0-100の数値,
      "説明": "計画性・責任感レベルと購買行動"
    },
    "外向性": {
      "スコア": 0-100の数値,
      "説明": "社交性レベルと情報取得方法への影響"
    },
    "協調性": {
      "スコア": 0-100の数値,
      "説明": "他者への配慮度と購買意思決定への影響"
    },
    "神経症傾向": {
      "スコア": 0-100の数値,
      "説明": "不安感・リスク回避度と購買決定への影響"
    }
  },
  
  "データソース": {
    "1次データソース": [
      {
        "機関名": "データ提供元の公式名称",
        "データ名": "データセット名",
        "URL": "https://...",
        "取得年": 2023,
        "信頼度": "1次"
      }
    ],
    "2次データソース": [
      {
        "機関名": "民間調査機関名",
        "データ名": "調査名",
        "URL": "https://...",
        "取得年": 2023,
        "信頼度": "2次"
      }
    ],
    "信頼性スコア": 100,
    "データ根拠": "このペルソナが100%検証済みデータに基づく理由を明記。推測データは含まない。",
    "ターゲット属性": "日本人口全体における該当比率の推定"
  }
}

【重要なルール】
- 信頼性スコアは常に100（100%未満のデータは除外）
- すべてのデータソースにURL付きで記述
- 推測、仮説、未確認情報は一切含めない
- Big Fiveスコアは0-100の数値で記述
- JSON形式のみで出力（説明や前置きは不要）
- 日本の政府統計、信頼できる民間調査機関のデータのみ使用
- 各トリガーは複数提供（最低3つ以上）
`;
};

export const generateDetailedPersona = async (
  personaRepresentative: {
    age: number;
    income: number;
    recognitionScore: number;
    purchaseIntent: number;
    region: string;
  },
  quadrant: "Q1" | "Q2" | "Q3" | "Q4",
  productData: {
    productName: string;
    category: string;
    price: string;
  },
  personaLetter: "A" | "B" | "C"
): Promise<PersonaDetails> => {
  try {
    const prompt = constructEnhancedPrompt(
      personaRepresentative,
      quadrant,
      productData,
      personaLetter
    );

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // JSON抽出と検証
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Claude response did not contain valid JSON");
    }

    const personaData = JSON.parse(jsonMatch[0]) as PersonaDetails;

    // データソースに検証済みデータを統合
    const dataSourcesFromDB = getDataSourcesForPersona(quadrant);
    personaData["データソース"] = {
      ...dataSourcesFromDB,
      "1次データソース": dataSourcesFromDB["1次データソース"],
      "2次データソース": dataSourcesFromDB["2次データソース"],
    };

    // Big Fiveスコアの検証
    Object.values(personaData["5Big診断"]).forEach((trait) => {
      if (typeof trait.スコア !== "number" || trait.スコア < 0 || trait.スコア > 100) {
        throw new Error("Invalid Big Five score");
      }
    });

    return personaData;
  } catch (error) {
    console.error("Error generating detailed persona:", error);
    throw error;
  }
};

// ========== フォールバック：モックデータ生成 ==========

export const generateMockPersona = (
  quadrant: "Q1" | "Q2" | "Q3" | "Q4",
  personaLetter: "A" | "B" | "C"
): PersonaDetails => {
  const mockTemplates: Record<"Q1" | "Q2" | "Q3" | "Q4", Partial<PersonaDetails>> = {
    "Q1": {
      "基本情報": {
        "名前": "田中太郎",
        "年齢": 50,
        "性別": "男性",
        "職業": "管理職",
        "経済状況": "高",
        "教育レベル": "大卒",
        "家族構成": "既婚・子あり",
        "居住地": "東京都",
      },
    },
    "Q2": {
      "基本情報": {
        "名前": "山田花子",
        "年齢": 24,
        "性別": "女性",
        "職業": "マネージャー",
        "経済状況": "中",
        "教育レベル": "大卒",
        "家族構成": "独身",
        "居住地": "東京都",
      },
    },
    "Q3": {
      "基本情報": {
        "名前": "佐藤次郎",
        "年齢": 33,
        "性別": "男性",
        "職業": "デザイナー",
        "経済状況": "中",
        "教育レベル": "大卒",
        "家族構成": "独身",
        "居住地": "東京都",
      },
    },
    "Q4": {
      "基本情報": {
        "名前": "鈴木健一",
        "年齢": 62,
        "性別": "男性",
        "職業": "退職者",
        "経済状況": "中",
        "教育レベル": "高卒",
        "家族構成": "既婚・子あり",
        "居住地": "東京都",
      },
    },
  };

  const template = mockTemplates[quadrant];

  // 完全なmockデータを構築
  const mockPersona: PersonaDetails = {
    "基本情報": template["基本情報"] || {
      名前: "mock",
      年齢: 30,
      性別: "男性",
      職業: "会社員",
      経済状況: "中",
      教育レベル: "大卒",
      家族構成: "独身",
      居住地: "東京都",
    },
    "デモグラフィック情報": {
      宗教: "無宗教",
      文化背景: "日本",
      使用言語: "日本語",
    },
    "サイコグラフィック情報": {
      ライフスタイル: "バランスの取れた生活",
      価値観: "安定性と成長",
      "趣味・興味": "読書、旅行",
      パーソナリティ: "社交的で責任感がある",
    },
    "行動情報": {
      購買行動の癖: "慎重だが行動的",
      情報収集方法: "インターネット検索",
      使用デバイス: "スマートフォン、PC",
      よく使うメディア: "YouTube、SNS",
    },
    "目標動機欲求": {
      短期欲求: "生活の質向上",
      長期欲求: "キャリア発展",
      動機: "自己実現への欲求",
    },
    "課題ペインポイント": {
      "現在の課題、悩み": "時間不足",
      不満点: "既存製品の機能不足",
      障壁: "価格",
    },
    "意思決定プロセス": {
      意思決定の流れ: "情報収集→検討→購入",
      影響を受けやすい要因: "ユーザーレビュー",
      購入決定に関与する人物: "自分",
    },
    "購入理由": "生活を豊かにするため",
    "AIDMA分析": {
      認知: "SNS広告で認知",
      興味: "レビュー動画で興味深化",
      欲求: "使ってみたいという欲求",
      記憶: "繰り返し目にして記憶",
      行動: "購入決定",
    },
    "カスタマージャーニー": {
      "認知段階": {
        段階: "認知",
        状況: "SNS広告を見かける",
        心理状態: "なんか良いな",
        行動: "簡単に調べる",
        タッチポイント: "Instagram",
      },
      "検討段階": {
        段階: "検討",
        状況: "複数製品を比較",
        心理状態: "本当に必要か",
        行動: "詳しく調べる",
        タッチポイント: "YouTube",
      },
      "決定段階": {
        段階: "決定",
        状況: "購入を決める",
        心理状態: "確信",
        行動: "カートに入れる",
        タッチポイント": "ECサイト",
      },
      "購入段階": {
        段階: "購入",
        状況: "決済処理",
        心理状態: "期待",
        行動: "購入完了",
        タッチポイント: "決済画面",
      },
    },
    "PDCA施策": {
      Plan: "マーケティング計画を立案",
      Do: "SNS広告とYouTubeを活用",
      Check: "CTRとCVRを測定",
      Action: "パフォーマンスを改善",
    },
    "心理転換点": [
      {
        トリガー: "SNS広告との接触",
        発生場面: "朝のSNS閲覧時",
        "心理的変化": "無関心→興味",
      },
      {
        トリガー: "YouTubeレビュー動画",
        発生場面: "検索結果から動画視聴",
        "心理的変化": "疑問→納得",
      },
      {
        トリガー: "友人からの推薦",
        発生場面": "友人との会話",
        "心理的変化": "不安→確信",
      },
    ],
    "5Big診断": {
      開放性: {
        スコア: 50,
        説明: "バランスの取れた開放性",
      },
      誠実性: {
        スコア: 65,
        説明: "責任感のある性格",
      },
      外向性: {
        スコア: 55,
        説明: "バランスの取れた社交性",
      },
      協調性: {
        スコア: 70,
        説明: "協調的で親切",
      },
      神経症傾向: {
        スコア: 40,
        説明: "比較的楽観的",
      },
    },
    "データソース": getDataSourcesForPersona(quadrant),
  };

  return mockPersona;
};
