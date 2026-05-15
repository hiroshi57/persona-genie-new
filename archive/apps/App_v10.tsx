/**
 * App_v10.tsx - Persona Genie Pro v10.0
 * ============================================================================
 * 新フロー: 入力 → 1000人シミュレーション → 特出3名ペルソナ（Big5含む）
 */

import React, { useState, useReducer, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Users,
  Brain,
  Target,
  ChevronRight,
  BarChart3,
  ExternalLink,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { ProductInfo, PersonaResponse, PersonaDetails } from './types_FIXED';
import { generatePersonas } from './geminiService_v9';
import { QuadrantSimulation } from './QuadrantSimulation';

// ========== Big5 タイプ ==========
interface Big5Profile {
  openness: number;        // 開放性 0-100
  conscientiousness: number; // 誠実性
  extraversion: number;    // 外向性
  agreeableness: number;   // 協調性
  neuroticism: number;     // 神経症傾向
}

// ========== 状態管理 ==========
type AppPhase = 'input' | 'simulation' | 'personas';

interface AppState {
  phase: AppPhase;
  productData: ProductInfo;
  personas: PersonaResponse | null;
  activePersona: 'A' | 'B' | 'C';
  activeTab: 'basic' | 'aidma' | 'journey' | 'pdca' | 'big5' | 'datasource';
  loading: boolean;
  loadingProgress: { A: boolean; B: boolean; C: boolean };
  error: string | null;
}

type AppAction =
  | { type: 'SET_PHASE'; payload: AppPhase }
  | { type: 'SET_PRODUCT_DATA'; payload: ProductInfo }
  | { type: 'SET_PERSONAS'; payload: PersonaResponse }
  | { type: 'SET_PERSONA_PROGRESS'; payload: { persona: 'A' | 'B' | 'C'; done: boolean } }
  | { type: 'SET_ACTIVE_PERSONA'; payload: 'A' | 'B' | 'C' }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialProductData: ProductInfo = {
  productName: '',
  category: '',
  releaseDate: '',
  price: '',
  salesChannels: '',
  features: { appearance: '', function: '', concept: '' },
  customerHypothesis: '',
  valueProposition: { assumedNeeds: '', solutionHypothesis: '' },
};

const initialState: AppState = {
  phase: 'input',
  productData: initialProductData,
  personas: null,
  activePersona: 'A',
  activeTab: 'basic',
  loading: false,
  loadingProgress: { A: false, B: false, C: false },
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_PRODUCT_DATA':
      return { ...state, productData: action.payload };
    case 'SET_PERSONAS':
      return { ...state, personas: action.payload, phase: 'personas', loading: false };
    case 'SET_PERSONA_PROGRESS':
      return {
        ...state,
        loadingProgress: { ...state.loadingProgress, [action.payload.persona]: action.payload.done },
      };
    case 'SET_ACTIVE_PERSONA':
      return { ...state, activePersona: action.payload, activeTab: 'basic' };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, loadingProgress: { A: false, B: false, C: false } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ========== Big5 生成（ペルソナ特性から推定） ==========
const generateBig5FromPersona = (persona: PersonaDetails): Big5Profile => {
  // ペルソナの特性からBig5を推定
  const psycho = persona['サイコグラフィック情報'];
  const behavior = persona['行動情報'];

  // 基本値 + ランダム変動
  const base = 50;
  const variance = () => (Math.random() - 0.5) * 30;

  // 開放性: 趣味の多様性、新しいものへの興味
  let openness = base + variance();
  if (psycho?.['趣味・興味']?.includes('旅行') || psycho?.['趣味・興味']?.includes('新しい')) {
    openness += 15;
  }

  // 誠実性: 計画性、責任感
  let conscientiousness = base + variance();
  if (persona['意思決定プロセス']?.['意思決定の流れ']?.includes('比較') ||
      persona['意思決定プロセス']?.['意思決定の流れ']?.includes('調査')) {
    conscientiousness += 15;
  }

  // 外向性: 社交性、活動性
  let extraversion = base + variance();
  if (behavior?.['よく使うメディア']?.includes('Instagram') ||
      behavior?.['よく使うメディア']?.includes('TikTok')) {
    extraversion += 15;
  }

  // 協調性: 他者への配慮
  let agreeableness = base + variance();
  if (persona['意思決定プロセス']?.['購入決定に関与する人物']?.includes('家族')) {
    agreeableness += 15;
  }

  // 神経症傾向: 不安傾向
  let neuroticism = base + variance();
  if (persona['課題ペインポイント']?.['現在の課題、悩み']?.includes('不安')) {
    neuroticism += 15;
  }

  const clamp = (v: number) => Math.max(10, Math.min(90, Math.round(v)));

  return {
    openness: clamp(openness),
    conscientiousness: clamp(conscientiousness),
    extraversion: clamp(extraversion),
    agreeableness: clamp(agreeableness),
    neuroticism: clamp(neuroticism),
  };
};

// ========== メインコンポーネント ==========
const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [big5Cache, setBig5Cache] = useState<Record<string, Big5Profile>>({});

  // Big5 を取得（キャッシュあり）
  const getBig5 = useCallback((personaKey: string, persona: PersonaDetails): Big5Profile => {
    if (big5Cache[personaKey]) {
      return big5Cache[personaKey];
    }
    const profile = generateBig5FromPersona(persona);
    setBig5Cache(prev => ({ ...prev, [personaKey]: profile }));
    return profile;
  }, [big5Cache]);

  // 入力フォームの更新
  const handleInputChange = useCallback((field: string, value: string) => {
    dispatch({
      type: 'SET_PRODUCT_DATA',
      payload: {
        ...state.productData,
        [field]: value,
      },
    });
  }, [state.productData]);

  const handleFeatureChange = useCallback((field: string, value: string) => {
    dispatch({
      type: 'SET_PRODUCT_DATA',
      payload: {
        ...state.productData,
        features: { ...state.productData.features, [field]: value },
      },
    });
  }, [state.productData]);

  // シミュレーションへ進む
  const handleGoToSimulation = useCallback(() => {
    dispatch({ type: 'SET_PHASE', payload: 'simulation' });
  }, []);

  // ペルソナ生成
  const handleGeneratePersonas = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await generatePersonas(state.productData, (personaType, _data) => {
        dispatch({ type: 'SET_PERSONA_PROGRESS', payload: { persona: personaType, done: true } });
      });
      dispatch({ type: 'SET_PERSONAS', payload: result });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'ペルソナ生成に失敗しました。APIキーと入力内容を確認してください。',
      });
      console.error(err);
    }
  }, [state.productData]);

  // 現在のペルソナ
  const currentPersona = useMemo(() => {
    if (!state.personas) return null;
    const key = `ペルソナ${state.activePersona}` as keyof PersonaResponse;
    return state.personas[key];
  }, [state.personas, state.activePersona]);

  // Big5 プロファイル
  const currentBig5 = useMemo(() => {
    if (!currentPersona) return null;
    return getBig5(state.activePersona, currentPersona);
  }, [currentPersona, state.activePersona, getBig5]);

  // ========== 入力フェーズ ==========
  if (state.phase === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧠</div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Persona Genie Pro v10.0
            </h1>
            <p className="text-slate-600">
              1000人シミュレーション + 特出3名ペルソナ（Big5診断付き）
            </p>
          </div>

          {/* 入力フォーム */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              製品情報を入力
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  商品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={state.productData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="例: プレミアムドッグフード"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  カテゴリー <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={state.productData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="例: ペット用品"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  価格
                </label>
                <input
                  type="text"
                  value={state.productData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="例: ¥5,980"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  販売チャネル
                </label>
                <input
                  type="text"
                  value={state.productData.salesChannels}
                  onChange={(e) => handleInputChange('salesChannels', e.target.value)}
                  placeholder="例: EC、ペットショップ"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  製品コンセプト
                </label>
                <textarea
                  value={state.productData.features.concept}
                  onChange={(e) => handleFeatureChange('concept', e.target.value)}
                  placeholder="例: 獣医師監修の国産無添加ドッグフード。健康志向の飼い主向け。"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ターゲット顧客仮説
                </label>
                <textarea
                  value={state.productData.customerHypothesis}
                  onChange={(e) => handleInputChange('customerHypothesis', e.target.value)}
                  placeholder="例: 30-40代の犬を飼っている共働き世帯。ペットの健康に気を使う。"
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* エラー表示 */}
            {state.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {state.error}
              </div>
            )}

            {/* 次へボタン */}
            <button
              onClick={handleGoToSimulation}
              disabled={!state.productData.productName || !state.productData.category}
              className="mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5" />
              1000人シミュレーションへ
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== シミュレーションフェーズ ==========
  if (state.phase === 'simulation') {
    return (
      <QuadrantSimulation
        productName={state.productData.productName}
        category={state.productData.category}
        onComplete={handleGeneratePersonas}
      />
    );
  }

  // ========== ペルソナ表示フェーズ ==========
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-6">🧠</div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            ペルソナ生成中...
          </h2>
          <div className="space-y-3">
            {(['A', 'B', 'C'] as const).map((p) => (
              <div key={p} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  state.loadingProgress[p] ? 'bg-green-500' : 'bg-slate-300'
                }`}>
                  {state.loadingProgress[p] ? '✓' : p}
                </div>
                <span className={`text-sm ${state.loadingProgress[p] ? 'text-green-600' : 'text-slate-500'}`}>
                  ペルソナ{p} {state.loadingProgress[p] ? '完了' : '生成中...'}
                </span>
                {!state.loadingProgress[p] && (
                  <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            3つのペルソナを並列生成しています
          </p>
        </div>
      </div>
    );
  }

  if (!state.personas || !currentPersona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>データがありません</p>
      </div>
    );
  }

  // タブ定義
  const tabs = [
    { id: 'basic', label: '基本情報', icon: <Users className="w-4 h-4" /> },
    { id: 'aidma', label: 'AIDMA', icon: <Target className="w-4 h-4" /> },
    { id: 'journey', label: 'ジャーニー', icon: <ChevronRight className="w-4 h-4" /> },
    { id: 'pdca', label: 'PDCA', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'big5', label: 'Big5診断', icon: <Brain className="w-4 h-4" /> },
    { id: 'datasource', label: 'データソース', icon: <ExternalLink className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {state.productData.productName} - ペルソナ分析
            </h1>
            <p className="text-slate-600">1000人から選出された特出すべき3名</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            最初から
          </button>
        </div>

        {/* ペルソナセレクター */}
        <div className="flex gap-4 mb-6">
          {(['A', 'B', 'C'] as const).map((p) => {
            const personaData = state.personas![`ペルソナ${p}` as keyof PersonaResponse];
            const labels = {
              A: '即購入層代表',
              B: '新市場開拓',
              C: '新価値発見',
            };
            return (
              <button
                key={p}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PERSONA', payload: p })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  state.activePersona === p
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    p === 'A' ? 'bg-green-500' : p === 'B' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {p}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">
                      {personaData['基本情報']['名前']}
                    </div>
                    <div className="text-xs text-slate-500">{labels[p]}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id as AppState['activeTab'] })}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                state.activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-indigo-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* 基本情報タブ */}
          {state.activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">基本情報</h3>
                <dl className="space-y-3">
                  {Object.entries(currentPersona['基本情報']).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-slate-600">{key}</dt>
                      <dd className="font-medium text-slate-800">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">サイコグラフィック</h3>
                <dl className="space-y-3">
                  {Object.entries(currentPersona['サイコグラフィック情報']).map(([key, value]) => (
                    <div key={key} className="border-b border-slate-100 pb-2">
                      <dt className="text-sm text-slate-500">{key}</dt>
                      <dd className="text-slate-800">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-4">購入理由</h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">
                  {currentPersona['購入理由']}
                </p>
              </div>
            </div>
          )}

          {/* AIDMAタブ */}
          {state.activeTab === 'aidma' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">AIDMA分析</h3>
              <div className="space-y-4">
                {Object.entries(currentPersona['AIDMA分析']).map(([stage, content], i) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
                  return (
                    <div key={stage} className="flex gap-4">
                      <div className={`w-20 h-20 ${colors[i]} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}>
                        {stage}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-700">{String(content)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ジャーニータブ */}
          {state.activeTab === 'journey' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">カスタマージャーニー</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
                <div className="space-y-6">
                  {Object.entries(currentPersona['カスタマージャーニー']).map(([stage, data], i) => (
                    <div key={stage} className="relative pl-16">
                      <div className="absolute left-0 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {i + 1}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="font-bold text-indigo-600 mb-2">{data['段階']}</h4>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <dt className="text-slate-500">状況</dt>
                            <dd className="text-slate-700">{data['状況']}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">心理状態</dt>
                            <dd className="text-slate-700">{data['心理状態']}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">行動</dt>
                            <dd className="text-slate-700">{data['行動']}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">タッチポイント</dt>
                            <dd className="text-slate-700">{data['タッチポイント']}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PDCAタブ */}
          {state.activeTab === 'pdca' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">PDCA施策</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentPersona['PDCA施策']).map(([phase, content]) => {
                  const colors: Record<string, string> = {
                    Plan: 'bg-blue-500',
                    Do: 'bg-green-500',
                    Check: 'bg-yellow-500',
                    Action: 'bg-red-500',
                  };
                  return (
                    <div key={phase} className="bg-slate-50 rounded-xl p-4">
                      <div className={`inline-block px-3 py-1 ${colors[phase]} text-white rounded-full text-sm font-bold mb-2`}>
                        {phase}
                      </div>
                      <p className="text-slate-700">{String(content)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Big5タブ */}
          {state.activeTab === 'big5' && currentBig5 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">Big5 パーソナリティ診断</h3>
              <div className="space-y-4">
                {[
                  { key: 'openness', label: '開放性', desc: '新しい経験への興味' },
                  { key: 'conscientiousness', label: '誠実性', desc: '計画性・責任感' },
                  { key: 'extraversion', label: '外向性', desc: '社交性・活動性' },
                  { key: 'agreeableness', label: '協調性', desc: '他者への配慮' },
                  { key: 'neuroticism', label: '神経症傾向', desc: '不安・ストレス感受性' },
                ].map(({ key, label, desc }) => {
                  const value = currentBig5[key as keyof Big5Profile];
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700">{label}</span>
                        <span className="text-indigo-600 font-bold">{value}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Big5 レーダーチャート風の説明 */}
              <div className="mt-8 p-4 bg-indigo-50 rounded-xl">
                <h4 className="font-bold text-indigo-800 mb-2">パーソナリティ特徴</h4>
                <p className="text-sm text-indigo-700">
                  このペルソナは
                  {currentBig5.openness > 60 && '新しいものに興味があり、'}
                  {currentBig5.conscientiousness > 60 && '計画的で責任感があり、'}
                  {currentBig5.extraversion > 60 && '社交的で活動的、'}
                  {currentBig5.agreeableness > 60 && '他者への配慮が高く、'}
                  {currentBig5.neuroticism > 60 && '慎重で細やかな性格'}
                  {currentBig5.openness <= 60 && currentBig5.conscientiousness <= 60 && currentBig5.extraversion <= 60 && currentBig5.agreeableness <= 60 && currentBig5.neuroticism <= 60 && 'バランスの取れた性格'}
                  です。
                </p>
              </div>
            </div>
          )}

          {/* データソースタブ */}
          {state.activeTab === 'datasource' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">データソース</h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                    <span className="font-bold text-green-800">
                      信頼性スコア: {currentPersona['データソース']['信頼性スコア']}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-700 mb-2">1次データソース</h4>
                  <p className="text-slate-600">
                    {currentPersona['データソース']['1次データソース']}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-700 mb-2">2次データソース</h4>
                  <p className="text-slate-600">
                    {currentPersona['データソース']['2次データソース']}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-700 mb-2">データ根拠</h4>
                  <p className="text-slate-600">
                    {currentPersona['データソース']['データ根拠']}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
