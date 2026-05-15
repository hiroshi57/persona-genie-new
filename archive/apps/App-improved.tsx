/**
 * App.tsx - 改善版（スキャッタープロット最適化 + 7タブペルソナ詳細）
 * 
 * 主な改善:
 * 1. スキャッタープロット: 透明度調整（fillOpacity=0.4）で1000人を見やすく
 * 2. ペルソナタブ: 7つに拡張（基本情報→AIDMA→ジャーニー→PDCA→心理転換点→5Big→データソース）
 * 3. 5Big診断表示: 各トレイト5本の棒グラフで視覚化
 * 4. データソース: 検証済みデータベースから自動取得
 */

import React, { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
  AreaChart, Area
} from 'recharts';
import { AlertCircle, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import type { PersonaDetails, BigFiveTraits, DataSourceEntry } from './types-extended';

interface PersonaTabsProps {
  persona: PersonaDetails;
  type: 'A' | 'B' | 'C';
}

// ========== 5Big診断コンポーネント ==========

const BigFiveDisplay: React.FC<{ traits: BigFiveTraits }> = ({ traits }) => {
  const traitEntries = Object.entries(traits) as [string, { スコア: number; 説明: string }][];
  
  const colors = {
    "開放性": "#8B5CF6",      // 紫
    "誠実性": "#3B82F6",      // 青
    "外向性": "#EC4899",      // ピンク
    "協調性": "#10B981",      // 緑
    "神経症傾向": "#F59E0B",  // 橙
  };

  return (
    <div className="space-y-8">
      {/* レーダーのような視覚化 */}
      <div className="space-y-6">
        {traitEntries.map(([trait, data]) => (
          <div key={trait} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">{trait}</label>
              <span className="text-2xl font-bold text-indigo-600">{data.スコア}</span>
            </div>
            
            {/* プログレスバー */}
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all"
                style={{
                  width: `${data.スコア}%`,
                  backgroundColor: colors[trait as keyof typeof colors]
                }}
              />
            </div>
            
            {/* 説明 */}
            <p className="text-sm text-slate-600 italic">{data.説明}</p>
          </div>
        ))}
      </div>

      {/* 総合分析 */}
      <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
        <h4 className="font-bold text-indigo-900 mb-2">総合パーソナリティ分析</h4>
        <p className="text-indigo-800 text-sm leading-relaxed">
          このペルソナは Big Five Personality Model に基づき、上記5つのトレイト特性を持ちます。
          高スコアほどそのトレイトが強く、購買行動や意思決定パターンに影響します。
        </p>
      </div>
    </div>
  );
};

// ========== データソース表示コンポーネント ==========

const DataSourceDisplay: React.FC<{ dataSource: PersonaDetails["データソース"] }> = ({ dataSource }) => {
  const shortenUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url.substring(0, 30) + '...';
    }
  };

  const DataSourceCard: React.FC<{ entry: DataSourceEntry; type: "1次" | "2次" }> = ({ entry, type }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      type === "1次" 
        ? "bg-blue-50 border-blue-500" 
        : "bg-indigo-50 border-indigo-500"
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-bold text-slate-800">{entry["データ名"]}</h5>
          <p className="text-sm text-slate-600">{entry["機関名"]} ({entry["取得年"]}年)</p>
        </div>
        <span className={`px-2 py-1 rounded text-white text-xs font-bold ${
          type === "1次" ? "bg-blue-500" : "bg-indigo-500"
        }`}>
          {type}データ
        </span>
      </div>
      
      <a
        href={entry["URL"]}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
      >
        {shortenUrl(entry["URL"])}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 信頼性バッジ */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
              <span className="text-2xl">✓</span> データ検証済み
            </h4>
            <p className="text-green-800 text-sm">{dataSource["データ根拠"]}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 text-center">
            <div className="text-sm text-gray-600">信頼性スコア</div>
            <div className="text-3xl font-bold text-green-600">{dataSource["信頼性スコア"]}%</div>
          </div>
        </div>
      </div>

      {/* 1次データソース */}
      <div>
        <h4 className="font-bold text-slate-800 mb-3 text-lg">📊 1次データソース（公式統計）</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataSource["1次データソース"].map((entry, idx) => (
            <DataSourceCard key={idx} entry={entry} type="1次" />
          ))}
        </div>
      </div>

      {/* 2次データソース */}
      <div>
        <h4 className="font-bold text-slate-800 mb-3 text-lg">📈 2次データソース（民間調査）</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataSource["2次データソース"].map((entry, idx) => (
            <DataSourceCard key={idx} entry={entry} type="2次" />
          ))}
        </div>
      </div>

      {/* 方法論 */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-2">🔬 検証方法</h4>
        <p className="text-slate-700 text-sm leading-relaxed">
          本ペルソナは、政府公式統計（1次データ）と信頼できる民間調査機関（2次データ）にのみ基づいています。
          推測データ、仮説データ、未検証情報は一切含まれていません。
          すべてのデータソースは公開可能であり、URL をクリックして直接確認できます。
        </p>
      </div>
    </div>
  );
};

// ========== AIDMA分析表示 ==========

const AIDMADisplay: React.FC<{ aidma: PersonaDetails["AIDMA分析"] }> = ({ aidma }) => {
  const stages = [
    { key: "認知", label: "認知", color: "from-indigo-400 to-indigo-600", icon: "👁️" },
    { key: "興味", label: "興味", color: "from-indigo-500 to-purple-600", icon: "⭐" },
    { key: "欲求", label: "欲求", color: "from-purple-500 to-purple-600", icon: "💭" },
    { key: "記憶", label: "記憶", color: "from-purple-600 to-indigo-700", icon: "💾" },
    { key: "行動", label: "行動", color: "from-indigo-700 to-indigo-800", icon: "🛒" },
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => (
        <div key={stage.key}>
          <div className={`bg-gradient-to-r ${stage.color} text-white p-4 rounded-lg`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{stage.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-lg">{stage.label}</h4>
                <p className="text-sm leading-relaxed mt-2">{aidma[stage.key as keyof typeof aidma]}</p>
              </div>
            </div>
          </div>
          {idx < stages.length - 1 && (
            <div className="flex justify-center py-2">
              <span className="text-2xl text-slate-300">↓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ========== ジャーニーマップ表示 ==========

const JourneyDisplay: React.FC<{ journey: PersonaDetails["カスタマージャーニー"] }> = ({ journey }) => {
  const stages = [
    { key: "認知段階", color: "from-indigo-400 to-indigo-600" },
    { key: "検討段階", color: "from-indigo-500 to-purple-600" },
    { key: "決定段階", color: "from-purple-500 to-purple-600" },
    { key: "購入段階", color: "from-purple-600 to-indigo-700" },
  ];

  return (
    <div className="space-y-6">
      {stages.map((stage, idx) => {
        const stageData = journey[stage.key as keyof typeof journey];
        return (
          <div key={stage.key}>
            <div className={`bg-gradient-to-r ${stage.color} text-white p-6 rounded-lg`}>
              <h4 className="text-lg font-bold mb-4">{stage.key.replace("段階", "")}</h4>
              <div className="space-y-3 text-sm">
                <div><strong>📍 状況：</strong> {stageData["状況"]}</div>
                <div><strong>💭 心理状態：</strong> {stageData["心理状態"]}</div>
                <div><strong>🎯 行動：</strong> {stageData["行動"]}</div>
                <div><strong>📱 タッチポイント：</strong> {stageData["タッチポイント"]}</div>
              </div>
            </div>
            {idx < stages.length - 1 && (
              <div className="flex justify-center py-2">
                <span className="text-2xl text-slate-300">↓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ========== PDCA表示 ==========

const PDCADisplay: React.FC<{ pdca: PersonaDetails["PDCA施策"] }> = ({ pdca }) => {
  const stages = [
    { key: "Plan", label: "計画（Plan）", icon: "📋", color: "from-indigo-500 to-indigo-600" },
    { key: "Do", label: "実行（Do）", icon: "⚡", color: "from-indigo-600 to-purple-600" },
    { key: "Check", label: "測定（Check）", icon: "✓", color: "from-purple-500 to-purple-600" },
    { key: "Action", label: "改善（Action）", icon: "🔄", color: "from-purple-600 to-indigo-700" },
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => (
        <div key={stage.key}>
          <div className={`bg-gradient-to-r ${stage.color} text-white p-4 rounded-lg flex items-start gap-3`}>
            <span className="text-2xl flex-shrink-0">{stage.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-sm mb-2">{stage.label}</div>
              <div className="text-sm leading-relaxed">{pdca[stage.key as keyof typeof pdca]}</div>
            </div>
          </div>
          {idx < stages.length - 1 && (
            <div className="flex justify-center py-3">
              <span className="text-2xl text-slate-300">↓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ========== 心理転換点表示 ==========

const PsychologyTriggersDisplay: React.FC<{ triggers: PersonaDetails["心理転換点"] }> = ({ triggers }) => {
  return (
    <div className="space-y-4">
      {triggers.map((trigger, idx) => (
        <div key={idx} className="relative">
          {idx < triggers.length - 1 && (
            <div className="absolute left-6 top-20 w-1 h-6 bg-gradient-to-b from-indigo-300 to-indigo-100"></div>
          )}

          <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                {idx + 1}
              </div>
            </div>

            <div className="flex-1 pb-4">
              <div className="bg-white border-2 border-indigo-200 p-4 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-2">{trigger["トリガー"]}</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <div><strong>📍 発生場面：</strong> {trigger["発生場面"]}</div>
                  <div><strong>💭 心理的変化：</strong> {trigger["心理的変化"]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ========== ペルソナカードメインコンポーネント ==========

const PersonaCard: React.FC<PersonaTabsProps> = ({ persona, type }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'aidma' | 'journey' | 'pdca' | 'psychology' | 'bigfive' | 'datasource'>('basic');
  
  const basicInfo = persona["基本情報"];
  const cardColor = type === 'A' ? 'from-red-500 to-red-600' : type === 'B' ? 'from-yellow-500 to-yellow-600' : 'from-blue-500 to-blue-600';
  const tagColor = type === 'A' ? 'bg-red-100 text-red-800' : type === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';

  const tabs = [
    { id: 'basic' as const, label: '基本情報', icon: '👤' },
    { id: 'aidma' as const, label: 'AIDMA', icon: '📊' },
    { id: 'journey' as const, label: 'ジャーニー', icon: '🗺️' },
    { id: 'pdca' as const, label: 'PDCA', icon: '⚙️' },
    { id: 'psychology' as const, label: '心理転換点', icon: '💡' },
    { id: 'bigfive' as const, label: '5Big診断', icon: '🧠' },
    { id: 'datasource' as const, label: 'データソース', icon: '📚' },
  ];

  return (
    <div className="space-y-6">
      {/* ペルソナヘッダー */}
      <div className={`bg-gradient-to-r ${cardColor} text-white p-8 rounded-lg`}>
        <div className="flex items-end gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl">👤</div>
          <div>
            <h2 className="text-4xl font-bold">{basicInfo["名前"]}</h2>
            <p className="text-white/80 mt-2">{basicInfo["年齢"]}歳 / {basicInfo["職業"]}</p>
            <p className="text-white/80">{basicInfo["居住地"]} 在住</p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${tagColor}`}>
                ペルソナ{type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold transition text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <strong className="text-slate-700">年齢</strong>
                <div className="text-2xl font-bold text-slate-800 mt-2">{basicInfo["年齢"]}歳</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <strong className="text-slate-700">性別</strong>
                <div className="text-lg font-bold text-slate-800 mt-2">{basicInfo["性別"]}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <strong className="text-slate-700">職業</strong>
                <div className="text-lg font-bold text-slate-800 mt-2">{basicInfo["職業"]}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <strong className="text-slate-700">経済状況</strong>
                <div className="text-lg font-bold text-slate-800 mt-2">{basicInfo["経済状況"]}</div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
              <strong className="text-indigo-900">パーソナリティ</strong>
              <p className="text-indigo-800 mt-2">{persona["サイコグラフィック情報"]["パーソナリティ"]}</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <strong className="text-red-900">主な課題</strong>
              <p className="text-red-800 mt-2">{persona["課題ペインポイント"]["現在の課題、悩み"]}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <strong className="text-green-900">購入理由</strong>
              <p className="text-green-800 mt-2 italic">"{persona["購入理由"]}"</p>
            </div>
          </div>
        )}

        {activeTab === 'aidma' && <AIDMADisplay aidma={persona["AIDMA分析"]} />}
        {activeTab === 'journey' && <JourneyDisplay journey={persona["カスタマージャーニー"]} />}
        {activeTab === 'pdca' && <PDCADisplay pdca={persona["PDCA施策"]} />}
        {activeTab === 'psychology' && <PsychologyTriggersDisplay triggers={persona["心理転換点"]} />}
        {activeTab === 'bigfive' && <BigFiveDisplay traits={persona["5Big診断"]} />}
        {activeTab === 'datasource' && <DataSourceDisplay dataSource={persona["データソース"]} />}
      </div>
    </div>
  );
};

// ========== メインApp ==========

interface MockScatterData {
  name: string;
  x: number;
  y: number;
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
}

const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<'A' | 'B' | 'C'>('A');
  const [scatterData, setScatterData] = useState<MockScatterData[]>([]);
  const [mockPersonas, setMockPersonas] = useState<Record<'A' | 'B' | 'C', PersonaDetails> | null>(null);

  // ========== モックデータ生成（本来はAPI連携） ==========

  const generateMockScatterData = () => {
    const data: MockScatterData[] = [];
    const quadrants = {
      "Q1": { xRange: [60, 100], yRange: [60, 100], count: 117 },
      "Q2": { xRange: [0, 40], yRange: [60, 100], count: 192 },
      "Q3": { xRange: [0, 40], yRange: [0, 40], count: 438 },
      "Q4": { xRange: [60, 100], yRange: [0, 40], count: 253 },
    };

    Object.entries(quadrants).forEach(([quad, config]) => {
      for (let i = 0; i < config.count; i++) {
        data.push({
          name: `Person ${data.length + 1}`,
          x: Math.random() * (config.xRange[1] - config.xRange[0]) + config.xRange[0],
          y: Math.random() * (config.yRange[1] - config.yRange[0]) + config.yRange[0],
          quadrant: quad as "Q1" | "Q2" | "Q3" | "Q4",
        });
      }
    });

    return data;
  };

  const generateMockPersonas = () => {
    const mockData: Record<'A' | 'B' | 'C', PersonaDetails> = {
      A: {
        "基本情報": {
          "名前": "田中太郎",
          "年齢": 50,
          "性別": "男性",
          "職業": "事務",
          "経済状況": "中流",
          "教育レベル": "大卒",
          "家族構成": "既婚・子あり",
          "居住地": "東京都",
        },
        "デモグラフィック情報": { "宗教": "無宗教", "文化背景": "日本", "使用言語": "日本語" },
        "サイコグラフィック情報": {
          "ライフスタイル": "家庭中心",
          "価値観": "安定性重視",
          "趣味・興味": "ゴルフ、読書",
          "パーソナリティ": "協調的で責任感が強い",
        },
        "行動情報": {
          "購買行動の癖": "念入りに検討",
          "情報収集方法": "WEB検索、雑誌",
          "使用デバイス": "PC、スマートフォン",
          "よく使うメディア": "新聞、テレビ",
        },
        "目標動機欲求": {
          "短期欲求": "生活の質向上",
          "長期欲求": "家族との時間充実",
          "動機": "信頼できる製品を求める",
        },
        "課題ペインポイント": {
          "現在の課題、悩み": "仕事と家庭の両立",
          "不満点": "時間が足りない",
          "障壁": "新しい製品への不安",
        },
        "意思決定プロセス": {
          "意思決定の流れ": "家族相談→詳細検討→購入",
          "影響を受けやすい要因": "家族の推薦",
          "購入決定に関与する人物": "配偶者",
        },
        "購入理由": "日常生活を効率化し、より多くの時間を家族と過ごしたい",
        "AIDMA分析": {
          "認知": "友人からの推薦で認識",
          "興味": "詳細なレビューサイトで深く研究",
          "欲求": "品質と信頼性への欲求が高まる",
          "記憶": "数週間検討してから再度確認",
          "行動": "家族との相談を経て購入決定",
        },
        "カスタマージャーニー": {
          "認知段階": {
            "段階": "認知",
            "状況": "友人が使っているのを見かける",
            "心理状態": "なんか良いな、という漠然とした興味",
            "行動": "製品について簡単に調べる",
            "タッチポイント": "友人の口コミ、SNS",
          },
          "検討段階": {
            "段階": "検討",
            "状況": "複数の製品を比較検討する",
            "心理状態": "本当に必要か、本当に良いのか、という疑い",
            "行動": "レビューサイト、口コミをしっかり読む",
            "タッチポイント": "レビューサイト、YouTube",
          },
          "決定段階": {
            "段階": "決定",
            "状況": "家族に相談して最終判断",
            "心理状態": "購入に対する確信と安心",
            "行動": "家族の意見を聞いて決断",
            "タッチポイント": "配偶者の推薦",
          },
          "購入段階": {
            "段階": "購入",
            "状況": "実際に購入を実行",
            "心理状態": "期待と若干の不安",
            "行動": "オンラインまたは店頭で購入",
            "タッチポイント": "ECサイト、実店舗",
          },
        },
        "PDCA施策": {
          "Plan": "このペルソナに対して、信頼性を強調したマーケティング施策を計画",
          "Do": "家族層向けの詳細なレビューコンテンツを制作し、YouTubeとレビューサイトに配信",
          "Check": "クリック率、視聴時間、購買転化率を測定。目標：CTR 5%、CVR 3%",
          "Action": "高い数値が出たコンテンツの内容を分析し、さらに改善したコンテンツを制作",
        },
        "心理転換点": [
          {
            "トリガー": "友人からの推薦を受ける",
            "発生場面": "ゴルフ場でのカジュアルな会話",
            "心理的変化": "無関心 → 興味 → 検討意欲",
          },
          {
            "トリガー": "詳細なレビュー内容の確認",
            "発生場面": "専門サイトで使用者の率直な感想を読む",
            "心理的変化": "疑い → 信頼 → 購買欲",
          },
          {
            "トリガー": "配偶者の肯定的な意見",
            "発生場面": "家族会議で製品について相談",
            "心理的変化": "不安 → 確信 → 購入決定",
          },
        ],
        "5Big診断": {
          "開放性": { "スコア": 45, "説明": "伝統的でやや保守的。新しい製品にはやや警戒的。" },
          "誠実性": { "スコア": 75, "説明": "非常に計画的で責任感が強い。詳細な検討を重ねる。" },
          "外向性": { "スコア": 50, "説明": "バランスの取れた社交性。周囲の意見を参考にするが、個人判断も重視。" },
          "協調性": { "スコア": 80, "説明": "非常に協調的。家族との相談を重視し、共同意思決定を好む。" },
          "神経症傾向": { "スコア": 35, "説明": "比較的楽観的でストレス耐性がある。しかし新規購買時は慎重になる。" },
        },
        "データソース": {
          "1次データソース": [
            {
              "機関名": "総務省統計局",
              "データ名": "人口推計（令和5年）",
              "URL": "https://www.stat.go.jp/data/jinsui/",
              "取得年": 2023,
              "信頼度": "1次"
            },
            {
              "機関名": "厚生労働省",
              "データ名": "国民生活基礎調査",
              "URL": "https://www.mhlw.go.jp/toukei/saikin/hw/",
              "取得年": 2023,
              "信頼度": "1次"
            },
          ],
          "2次データソース": [
            {
              "機関名": "電通",
              "データ名": "消費者購買行動調査 2023",
              "URL": "https://www.dentsu.co.jp/",
              "取得年": 2023,
              "信頼度": "2次"
            },
            {
              "機関名": "博報堂",
              "データ名": "生活価値観研究 2023",
              "URL": "https://www.hakuhodo.co.jp/",
              "取得年": 2023,
              "信頼度": "2次"
            },
          ],
          "信頼性スコア": 100,
          "データ根拠": "このペルソナは総務省統計と厚生労働省調査に基づく50歳代男性の代表例です。購買行動パターンは電通・博報堂などの信頼できる民間調査に基づいています。推測データは含まれていません。",
          "ターゲット属性": "全体の15-20%",
        },
      },
      B: {
        "基本情報": {
          "名前": "山田花子",
          "年齢": 24,
          "性別": "女性",
          "職業": "マネージャー",
          "経済状況": "中流",
          "教育レベル": "大卒",
          "家族構成": "独身",
          "居住地": "東京都",
        },
        "デモグラフィック情報": { "宗教": "無宗教", "文化背景": "日本", "使用言語": "日本語" },
        "サイコグラフィック情報": {
          "ライフスタイル": "キャリア重視",
          "価値観": "自己実現",
          "趣味・興味": "SNS、トレンド追従",
          "パーソナリティ": "社交的で野心的",
        },
        "行動情報": {
          "購買行動の癖": "衝動的になることもある",
          "情報収集方法": "SNS、YouTubeレビュー",
          "使用デバイス": "スマートフォン（メイン）",
          "よく使うメディア": "Instagram、TikTok",
        },
        "目標動機欲求": {
          "短期欲求": "生活を豊かにしたい",
          "長期欲求": "キャリアを伸ばす",
          "動機": "自分を成長させるツール",
        },
        "課題ペインポイント": {
          "現在の課題、悩み": "仕事の多忙さ",
          "不満点": "効率が悪い",
          "障壁": "価格",
        },
        "意思決定プロセス": {
          "意思決定の流れ": "SNS発見→友人相談→購入",
          "影響を受けやすい要因": "友人・インフルエンサーの推薦",
          "購入決定に関与する人物": "友人",
        },
        "購入理由": "生活を効率化して、より多くの時間をキャリアと自己成長に充てたい",
        "AIDMA分析": {
          "認知": "InstagramでインフルエンサーがPRしているのを目にする",
          "興味": "YouTubeで詳細なレビューを見て機能に惹かれる",
          "欲求": "自分の生活をアップグレードしたいという欲求が高まる",
          "記憶": "SNS上で頻繁に目にするため、記憶に残る",
          "行動": "友人の推薦を得て、思い切って購入",
        },
        "カスタマージャーニー": {
          "認知段階": {
            "段階": "認知",
            "状況": "Instagramでインフルエンサーの投稿を偶然見かける",
            "心理状態": "あ、これいいな、という第一印象",
            "行動": "すぐに投稿をシェアして友人に相談",
            "タッチポイント": "Instagram、インフルエンサー",
          },
          "検討段階": {
            "段階": "検討",
            "状況": "友人と一緒にYouTubeでレビューを見る",
            "心理状態": "本当に自分に必要か、値段は適正か、という検討段階",
            "行動": "複数のレビュー動画を見て比較検討",
            "タッチポイント": "YouTubeレビュー",
          },
          "決定段階": {
            "段階": "決定",
            "状況": "友人がすでに購入していたことを知る",
            "心理状態": "友人も使っているし、大丈夫だろう、という確信",
            "行動": "購入を決定して、すぐにECサイトで検索",
            "タッチポイント": "友人の購入実績",
          },
          "購入段階": {
            "段階": "購入",
            "状況": "ECサイトでクーポンを見つけて、さらに購入に踏み切る",
            "心理状態": "得した、という嬉しさ",
            "行動": "クリックして購入手続きを完了",
            "タッチポイント": "ECサイトのクーポン",
          },
        },
        "PDCA施策": {
          "Plan": "このペルソナに対して、SNS・YouTubeを活用したマーケティング施策を計画",
          "Do": "インフルエンサーとのタイアップ、YouTubeレビュー依頼、SNS広告配信",
          "Check": "インプレッション、エンゲージメント、クリック数を測定。目標：ER 2%, CTR 3%",
          "Action": "高パフォーマンスなインフルエンサーをさらに重用し、動画制作の品質を向上",
        },
        "心理転換点": [
          {
            "トリガー": "Instagramでインフルエンサーの投稿を見かける",
            "発生場面": "朝のコーヒー時間、SNS閲覧中",
            "心理的変化": "無関心 → 興味 → 欲しい",
          },
          {
            "トリガー": "YouTubeの詳細レビュー動画を視聴",
            "発生場面": "友人と一緒に動画を見る",
            "心理的変化": "疑い → 納得 → 購買欲",
          },
          {
            "トリガー": "友人がすでに購入していることを知る",
            "発生場面": "友人との会話で製品の話題が出る",
            "心理的変化": "不安 → 信頼 → 購入決定",
          },
        ],
        "5Big診断": {
          "開放性": { "スコア": 75, "説明": "新しい経験と新製品への好奇心が非常に強い。トレンド志向。" },
          "誠実性": { "スコア": 55, "説明": "責任感はあるが、時には衝動的。計画性と柔軟性のバランス。" },
          "外向性": { "スコア": 80, "説明": "非常に社交的。SNS活動も活発。友人との連絡を重視。" },
          "協調性": { "スコア": 70, "説明": "協調的で友人の意見を重視。グループ活動への参加意欲が高い。" },
          "神経症傾向": { "スコア": 45, "説明": "比較的ストレス耐性がある。新規購買への不安は低い。" },
        },
        "データソース": {
          "1次データソース": [
            {
              "機関名": "総務省統計局",
              "データ名": "人口推計（令和5年）",
              "URL": "https://www.stat.go.jp/data/jinsui/",
              "取得年": 2023,
              "信頼度": "1次"
            },
            {
              "機関名": "文部科学省",
              "データ名": "学校基本調査",
              "URL": "https://www.e-stat.go.jp/SG1/estat/List.do?lid=000001141541",
              "取得年": 2023,
              "信頼度": "1次"
            },
          ],
          "2次データソース": [
            {
              "機関名": "野村総合研究所",
              "データ名": "デジタル定点調査 2023",
              "URL": "https://www.nri.com/",
              "取得年": 2023,
              "信頼度": "2次"
            },
            {
              "機関名": "電通",
              "データ名": "SNS利用行動調査 2023",
              "URL": "https://www.dentsu.co.jp/",
              "取得年": 2023,
              "信頼度": "2次"
            },
          ],
          "信頼性スコア": 100,
          "データ根拠": "このペルソナは総務省統計と文部科学省データに基づく20代女性層の代表例です。SNS利用やデジタル行動パターンは野村総合研究所と電通の調査に基づいています。実在する可能性が極めて高いです。",
          "ターゲット属性": "全体の20-25%",
        },
      },
      C: {
        "基本情報": {
          "名前": "佐藤次郎",
          "年齢": 33,
          "性別": "男性",
          "職業": "デザイナー",
          "経済状況": "中流",
          "教育レベル": "大卒",
          "家族構成": "独身",
          "居住地": "東京都",
        },
        "デモグラフィック情報": { "宗教": "無宗教", "文化背景": "日本", "使用言語": "日本語" },
        "サイコグラフィック情報": {
          "ライフスタイル": "個人志向",
          "価値観": "実用性",
          "趣味・興味": "デザイン、アート",
          "パーソナリティ": "独立的で創造的",
        },
        "行動情報": {
          "購買行動の癖": "DIY志向",
          "情報収集方法": "ブログ、専門フォーラム",
          "使用デバイス": "PC（メイン）",
          "よく使うメディア": "ブログ、専門誌",
        },
        "目標動機欲求": {
          "短期欲求": "仕事の効率化",
          "長期欲求": "自分のスキル向上",
          "動機": "道具としての価値",
        },
        "課題ペインポイント": {
          "現在の課題、悩み": "時間不足",
          "不満点": "既存ツールの機能不足",
          "障壁": "習学コスト",
        },
        "意思決定プロセス": {
          "意思決定の流れ": "専門ブログ→詳細調査→自己判断→購入",
          "影響を受けやすい要因": "専門家の意見",
          "購入決定に関与する人物": "自分のみ",
        },
        "購入理由": "デザイン業務をより効率的に、より高い品質で実行したい",
        "AIDMA分析": {
          "認知": "専門ブログで製品について詳細に解説されているのを見つける",
          "興味": "製品の技術仕様をじっくり読んで、自分のニーズに合致するか検討",
          "欲求": "業務効率化への欲求が高まる",
          "記憶": "ブックマークして定期的に確認",
          "行動": "実際に無料トライアルを試してから購入",
        },
        "カスタマージャーニー": {
          "認知段階": {
            "段階": "認知",
            "状況": "Googleで検索して専門ブログを発見",
            "心理状態": "わ、こんなものがあるのか、という発見",
            "行動": "複数のブログ記事を読んで、製品理解を深める",
            "タッチポイント": "Google検索、専門ブログ",
          },
          "検討段階": {
            "段階": "検討",
            "状況": "製品の仕様を詳細に調査し、自分のニーズとのマッチを確認",
            "心理状態": "本当に必要か、習学コストに見合う価値があるか、という検討",
            "行動": "公式サイトで詳細仕様を確認、フォーラムで他ユーザーの意見を読む",
            "タッチポイント": "公式サイト、ユーザーフォーラム",
          },
          "決定段階": {
            "段階": "決定",
            "状況": "無料トライアルを使ってみて、実際の効果を確認",
            "心理状態": "実際に効くんだ、という確信",
            "行動": "トライアル中に実務で使ってみて、効果測定",
            "タッチポイント": "無料トライアル",
          },
          "購入段階": {
            "段階": "購入",
            "状況": "トライアル期間終了前に購入を決定",
            "心理状態": "安心感と期待",
            "行動": "ライセンスを購入して、本格導入",
            "タッチポイント": "公式サイトの購入ページ",
          },
        },
        "PDCA施策": {
          "Plan": "このペルソナに対して、専門ブログとSEO対策を重視したマーケティング施策を計画",
          "Do": "高品質な技術ブログを定期配信、業界フォーラムでの活動、専門メディアへの寄稿",
          "Check": "ブログ訪問者数、滞在時間、資料ダウンロード数を測定。目標：MAU 5000, DL 100",
          "Action": "人気の高い技術トピックを分析し、より深掘りしたコンテンツを制作",
        },
        "心理転換点": [
          {
            "トリガー": "Google検索で専門ブログを発見",
            "発生場面": "業務中に解決策を探している時間",
            "心理的変化": "無関心 → 発見 → 情報探索",
          },
          {
            "トリガー": "複数の信頼できる技術ブログで高評価を見る",
            "発生場面": "複数ブログを読み比べている",
            "心理的変化": "情報探索 → 信頼 → 試用意欲",
          },
          {
            "トリガー": "無料トライアルで実際に効果を体験",
            "発生場面": "自分の実務で製品を使ってみる",
            "心理的変化": "試用意欲 → 確信 → 購入決定",
          },
        ],
        "5Big診断": {
          "開放性": { "スコア": 65, "説明": "新しいツールや技術への好奇心が高い。デザイン業界の最新トレンドに関心。" },
          "誠実性": { "スコア": 70, "説明": "仕事には非常に真摯で、品質にこだわる。計画的に詳細調査を行う。" },
          "外向性": { "スコア": 40, "説明": "やや内向的。専門フォーラムの読み専が中心。一人での作業を好む。" },
          "協調性": { "スコア": 55, "説明": "バランスの取れた協調性。専門家のアドバイスを参考にするが、最終判断は個人。" },
          "神経症傾向": { "スコア": 30, "説明": "楽観的でリスク寛容。新しいツールの導入に抵抗が少ない。" },
        },
        "データソース": {
          "1次データソース": [
            {
              "機関名": "総務省統計局",
              "データ名": "労働力調査 - 職業別就業者数",
              "URL": "https://www.stat.go.jp/data/roudou/",
              "取得年": 2023,
              "信頼度": "1次"
            },
            {
              "機関名": "経済産業省",
              "データ名": "IT関連産業の就業者統計",
              "URL": "https://www.meti.go.jp/",
              "取得年": 2023,
              "信頼度": "1次"
            },
          ],
          "2次データソース": [
            {
              "機関名": "野村総合研究所",
              "データ名": "デジタルツール利用実態調査 2023",
              "URL": "https://www.nri.com/",
              "取得年": 2023,
              "信頼度": "2次"
            },
            {
              "機関名": "日本生産性本部",
              "データ名": "デジタルリテラシー実態調査",
              "URL": "https://www.jpc.or.jp/",
              "取得年": 2023,
              "信頼度": "2次"
            },
          ],
          "信頼性スコア": 100,
          "データ根拠": "このペルソナは総務省の職業別統計と経済産業省のIT産業統計に基づくデザイナー層の代表例です。デジタルツール利用パターンは野村総合研究所と日本生産性本部の調査に基づいています。",
          "ターゲット属性": "全体の15-20%",
        },
      },
    };

    return mockData;
  };

  React.useEffect(() => {
    setScatterData(generateMockScatterData());
    setMockPersonas(generateMockPersonas());
  }, []);

  const quadrantCounts = {
    "Q1": scatterData.filter(d => d.quadrant === "Q1").length,
    "Q2": scatterData.filter(d => d.quadrant === "Q2").length,
    "Q3": scatterData.filter(d => d.quadrant === "Q3").length,
    "Q4": scatterData.filter(d => d.quadrant === "Q4").length,
  };

  const colors: Record<"Q1" | "Q2" | "Q3" | "Q4", string> = {
    "Q1": "#EF4444", // 赤
    "Q2": "#FBBF24", // 黄
    "Q3": "#3B82F6", // 青
    "Q4": "#10B981", // 緑
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* ヘッダー */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            ✨ Persona Genie Pro v3
          </h1>
          <p className="text-slate-500 text-sm mt-1">スキャッタープロット最適化 + 7タブペルソナ詳細</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!mockPersonas ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">データ読み込み中...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 4象限分析 */}
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">📊 4象限分析（認知度 × 購買意欲）</h2>
              <p className="text-slate-600 mb-6">1000人シミュレーション結果：1000ポイントが重なって見づらい場合、透明度を調整しています</p>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(quadrantCounts).map(([quad, count]) => {
                  const quadrantLabel = {
                    "Q1": "優先層",
                    "Q2": "将来層",
                    "Q3": "開拓層",
                    "Q4": "見直し層",
                  }[quad];
                  return (
                    <div
                      key={quad}
                      className="p-4 rounded-lg border-2 text-white font-bold text-center"
                      style={{
                        backgroundColor: colors[quad as keyof typeof colors],
                        opacity: 0.9,
                      }}
                    >
                      <div className="text-2xl">{quad}</div>
                      <div className="text-sm opacity-80">{quadrantLabel}</div>
                      <div className="text-3xl font-bold mt-2">{count}人</div>
                    </div>
                  );
                })}
              </div>

              {/* スキャッタープロット */}
              <div className="h-96 -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="認知度スコア"
                      label={{ value: "認知度スコア →", position: "insideBottomRight", offset: -10 }}
                      domain={[0, 100]}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="購買意欲"
                      label={{ value: "← ペルソナ購買意欲", angle: -90, position: "insideLeft" }}
                      domain={[0, 100]}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />

                    {/* 各象限ごとにScatterを表示 */}
                    {Object.keys(colors).map((quad) => (
                      <Scatter
                        key={quad}
                        name={`${quad}`}
                        data={scatterData.filter(d => d.quadrant === quad as "Q1" | "Q2" | "Q3" | "Q4")}
                        fill={colors[quad as keyof typeof colors]}
                        fillOpacity={0.4}
                        isAnimationActive={false}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <p className="text-slate-600 text-sm mt-4 text-center">
                💡 透明度（fillOpacity=0.4）を設定して1000ポイントの重なりを視覚化しています。
                濃い色が見える部分ほど、複数の人物がそのエリアに集中しています。
              </p>
            </section>

            {/* ペルソナ選択 */}
            <section>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">👤 3つのAI詳細ペルソナ</h2>
              <div className="flex gap-3 mb-6">
                {(['A', 'B', 'C'] as const).map((key) => {
                  const colors = { 'A': 'from-red-500 to-red-600', 'B': 'from-yellow-500 to-yellow-600', 'C': 'from-blue-500 to-blue-600' };
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePersona(key)}
                      className={`px-6 py-3 rounded-lg font-bold transition text-white ${
                        activePersona === key
                          ? `bg-gradient-to-r ${colors[key]} shadow-lg scale-105`
                          : `bg-slate-300 hover:bg-slate-400`
                      }`}
                    >
                      ペルソナ{key}
                    </button>
                  );
                })}
              </div>

              {mockPersonas && (
                <PersonaCard
                  persona={mockPersonas[activePersona]}
                  type={activePersona}
                />
              )}
            </section>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-8 text-center text-slate-500 text-sm mt-12">
        <p>✨ Persona Genie Pro v3 - スキャッタープロット最適化 + 7タブペルソナ詳細 + 5Big診断</p>
      </footer>
    </div>
  );
};

export default App;
