import React, { useState, useRef, useMemo, useCallback } from "react";
import { Sparkles } from "lucide-react";
import type { SimulationResult, ProductInfo, PersonaDetails, ComputedBig5 } from "../../../types";
import { computeAggregateBig5 } from "../../../big5Engine";
import { getDataSourcesForPersona } from "../../../datasources";
import { getCacheKey, getCachedPersonas, setCachedPersonas } from "../../../personaCache";
import PersonaCard from "./PersonaCard";

interface PersonaTabProps {
  simulationResult: SimulationResult;
  productData: ProductInfo;
  personas: PersonaDetails[] | null;
  setPersonas: (p: PersonaDetails[] | null) => void;
  personaLoading: boolean;
  setPersonaLoading: (b: boolean) => void;
}

const QUADRANTS = ["Q1", "Q2", "Q3", "Q4"] as const;
const LABELS = ["ペルソナA", "ペルソナB", "ペルソナC"];

function generateMockPersona(
  quadrant: typeof QUADRANTS[number],
  big5: ComputedBig5,
  representative: { age: number; occupation: string; region: string; income: string }
): PersonaDetails {
  const names: Record<string, string> = { Q1: "高橋 健太", Q2: "山田 美咲", Q3: "佐藤 次郎", Q4: "鈴木 由美" };
  const genders: Record<string, string> = { Q1: "男性", Q2: "女性", Q3: "男性", Q4: "女性" };

  return {
    "基本情報": {
      名前: names[quadrant] || "田中 太郎",
      年齢: representative.age,
      性別: genders[quadrant] || "男性",
      職業: representative.occupation,
      経済状況: representative.income === "high" ? "高" : representative.income === "low" ? "低" : "中",
      教育レベル: "大卒",
      家族構成: quadrant === "Q1" ? "既婚・子あり" : quadrant === "Q2" ? "独身" : "既婚",
      居住地: representative.region,
    },
    "デモグラフィック情報": { 宗教: "無宗教", 文化背景: "日本", 使用言語: "日本語" },
    "サイコグラフィック情報": {
      ライフスタイル: quadrant === "Q1" ? "品質重視の豊かな生活" : quadrant === "Q2" ? "SNS活用のトレンド志向" : "実用重視の堅実な生活",
      価値観: quadrant === "Q1" ? "品質と信頼性" : quadrant === "Q2" ? "成長と新しさ" : "安定と実用性",
      "趣味・興味": "読書、旅行、映画鑑賞",
      パーソナリティ: "社交的で責任感がある",
    },
    "行動情報": {
      購買行動の癖: quadrant === "Q1" ? "品質重視で慎重に比較検討" : "価格を重視しつつレビューを確認",
      情報収集方法: quadrant === "Q2" ? "SNS、YouTube" : "検索エンジン、レビューサイト",
      使用デバイス: "スマートフォン、PC",
      よく使うメディア: quadrant === "Q2" ? "Instagram、YouTube" : "Google、Yahoo!ニュース",
    },
    "目標動機欲求": { 短期欲求: "生活の質向上", 長期欲求: "キャリア発展", 動機: "自己実現への欲求" },
    "課題ペインポイント": { "現在の課題、悩み": "時間不足", 不満点: "既存製品の機能不足", 障壁: "価格" },
    "意思決定プロセス": {
      意思決定の流れ: "情報収集→比較検討→レビュー確認→購入決定",
      "影響を受けやすい要因": "ユーザーレビュー、口コミ",
      "購入決定に関与する人物": quadrant === "Q1" ? "家族" : "自分",
    },
    購入理由: "生活を豊かにするため",
    AIDMA分析: {
      認知: quadrant === "Q1" ? "専門メディアやSNS広告で認知" : "友人の推薦やSNSで認知",
      興味: "機能面の特徴に興味を持つ",
      欲求: "実際の使用シーンを想像して欲求が高まる",
      記憶: "繰り返し接触により記憶に定着",
      行動: quadrant === "Q1" ? "ECサイトで即購入" : "セール時に購入を決断",
    },
    カスタマージャーニー: {
      認知段階: { 段階: "認知", 状況: "SNSで商品情報に接触", 心理状態: "なんか良さそう", 行動: "簡単に調べる", タッチポイント: "Instagram" },
      検討段階: { 段階: "検討", 状況: "複数製品を比較", 心理状態: "本当に必要か検討", 行動: "レビュー動画を見る", タッチポイント: "YouTube" },
      決定段階: { 段階: "決定", 状況: "購入を決める", 心理状態: "確信", 行動: "カートに入れる", タッチポイント: "ECサイト" },
      購入段階: { 段階: "購入", 状況: "決済処理", 心理状態: "期待", 行動: "購入完了", タッチポイント: "決済画面" },
    },
    PDCA施策: {
      Plan: `${quadrant}層向けマーケティング計画を立案`,
      Do: quadrant === "Q2" ? "SNS広告とインフルエンサーを活用" : "検索広告とレビュー施策を展開",
      Check: "CTR、CVR、ROASを測定",
      Action: "データに基づきクリエイティブを改善",
    },
    心理転換点: [
      { トリガー: "SNS広告との接触", 発生場面: "朝のSNS閲覧時", "心理的変化": "無関心→興味" },
      { トリガー: "レビュー動画の視聴", 発生場面: "YouTube検索結果から", "心理的変化": "疑問→納得" },
      { トリガー: "友人からの推薦", 発生場面: "友人との会話", "心理的変化": "不安→確信" },
    ],
    "人間科学4要素": {
      認知: {
        理解していること: "商品の基本機能と価格帯は正しく把握している",
        誤解しやすいポイント: "「自分には難しそう」という先入観で高機能を過小評価する",
        難しいと感じる部分: "初期設定や公式サイトの説明が専門的で離脱しやすい",
      },
      感情: {
        主要感情: "「失敗したくない」不安と「良さそう」期待が拮抗している",
        感情が障壁になるシーン: "申し込み直前・個人情報入力時に不安が高まり離脱",
        感情を転換するきっかけ: "知人の成功体験・返金保証・無料トライアルで不安解消",
      },
      行動: {
        実際の行動パターン: "「興味あり」と言いながら比較サイトをブックマークしたまま放置",
        言動のズレ: "「セールになったら買う」と言うが、セールでも購入しない",
        行動変化のトリガー: "期限（タイムセール・締め切り）か身近な人の購入報告で動く",
      },
      身体状態: {
        典型的な使用シーン: "仕事終わり・就寝前のリラックスタイムに検討することが多い",
        デバイスと操作環境: "スマホ横持ちまたは片手操作。長文読了率が低く画像・動画に反応",
        集中力と余裕の状態: "疲労状態での閲覧が多く、複雑な判断は「また今度」になりやすい",
      },
    },
    "動かない理由分析": {
      損失回避: "購入費用の損失と「使いこなせなかった時の時間の無駄」を強く意識",
      失敗回避: "「買っても結局使わなくなる」という過去の失敗体験の再現を恐れる",
      承認欲求: "「衝動買いと思われたくない」意識から、合理的に見える理由を求める",
      説明コスト: "家族（特に配偶者）への説明が必要。簡潔に説明できないと止まる",
      初回障壁: "会員登録・クレジットカード入力・初期設定の手間。最初の5分が最大の壁",
      自己認識ギャップ: "「今のやり方で十分」と感じているが実際は月数時間の非効率が発生",
    },
    "5Big診断": big5,
    データソース: getDataSourcesForPersona(quadrant),
  };
}

const PersonaTab: React.FC<PersonaTabProps> = ({
  simulationResult, productData, personas, setPersonas, personaLoading, setPersonaLoading,
}) => {
  const [big5Data, setBig5Data] = useState<ComputedBig5[]>([]);
  const [quadrantLabels, setQuadrantLabels] = useState<string[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sortedQuadrants = useMemo(() => {
    const dist = simulationResult.statistics.quadrantDistribution;
    return QUADRANTS.slice().sort((a, b) => dist[b] - dist[a]).slice(0, 3);
  }, [simulationResult]);

  const quadrantPersons = useMemo(() =>
    sortedQuadrants.map((q) => simulationResult.persons.filter((p) => p.quadrant === q)),
    [sortedQuadrants, simulationResult.persons]
  );

  const startCooldown = useCallback(() => {
    setCooldown(30);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleGenerate = useCallback(async () => {
    setPersonaLoading(true);
    try {
      const cacheKey = getCacheKey(productData);
      const cached = getCachedPersonas(cacheKey);
      if (cached !== null) {
        setPersonas(cached);
        setPersonaLoading(false);
        startCooldown();
        return;
      }

      const generatedPersonas: PersonaDetails[] = [];
      const generatedBig5: ComputedBig5[] = [];

      for (let qi = 0; qi < sortedQuadrants.length; qi++) {
        const q = sortedQuadrants[qi];
        const qPersons = quadrantPersons[qi];
        const big5 = computeAggregateBig5(qPersons.slice(0, 500));
        const rep = qPersons[0];

        const persona = generateMockPersona(q, big5, {
          age: rep?.age ?? 35,
          occupation: rep?.occupation ?? "会社員",
          region: rep?.region ?? "東京都",
          income: rep?.income ?? "middle",
        });

        generatedPersonas.push(persona);
        generatedBig5.push(big5);
      }

      setPersonas(generatedPersonas);
      setBig5Data(generatedBig5);
      setQuadrantLabels(sortedQuadrants);
      setCachedPersonas(cacheKey, generatedPersonas);
    } catch (err) {
      console.error("Persona generation error:", err);
    } finally {
      setPersonaLoading(false);
      startCooldown();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData, sortedQuadrants, quadrantPersons, startCooldown]);

  if (!personas) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-6 shadow-sm">
            <Sparkles className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">AI ペルソナ分析</h2>
          <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
            シミュレーションデータから3つの代表ペルソナを生成します。<br />
            <span className="font-semibold text-slate-600">5レイヤー構造</span>で分析：
            WHO（属性・BIG5）→ HOW（人間科学4要素）→ WHY NOT（動かない理由6要因）→ JOURNEY（AIDMA・カスタマージャーニー）→ ACTION（PDCA施策）
          </p>
          <button
            onClick={handleGenerate}
            disabled={personaLoading || cooldown > 0}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-200 transition disabled:opacity-50"
          >
            {personaLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                生成中...
              </>
            ) : cooldown > 0 ? (
              <>
                <Sparkles className="w-4 h-4" />
                再生成まで {cooldown}秒
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                3つのAI詳細ペルソナを生成
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {personas.map((persona, i) => (
        <PersonaCard
          key={persona["基本情報"].名前 + i}
          persona={persona}
          big5={big5Data[i] || persona["5Big診断"]}
          label={LABELS[i]}
          quadrant={quadrantLabels[i] || "Q1"}
        />
      ))}
      <button
        onClick={() => { setPersonas(null); setBig5Data([]); setQuadrantLabels([]); }}
        disabled={cooldown > 0}
        className="w-full py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-50"
      >
        {cooldown > 0 ? `再生成まで ${cooldown}秒` : "ペルソナを再生成"}
      </button>
    </div>
  );
};

export default PersonaTab;
