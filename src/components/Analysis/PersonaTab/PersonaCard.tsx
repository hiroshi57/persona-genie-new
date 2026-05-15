import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PersonaDetails, ComputedBig5 } from "../../../types";
import Big5Chart from "./Big5Chart";
import AIDMADisplay from "./AIDMADisplay";
import JourneyDisplay from "./JourneyDisplay";
import PDCADisplay from "./PDCADisplay";
import TriggersDisplay from "./TriggersDisplay";

interface PersonaCardProps {
  persona: PersonaDetails;
  big5: ComputedBig5;
  label: string;
  quadrant: string;
}

const QUADRANT_STYLES: Record<string, { badge: string; header: string }> = {
  Q1: { badge: "bg-red-100 text-red-700 border-red-200", header: "from-red-500 to-rose-500" },
  Q2: { badge: "bg-amber-100 text-amber-700 border-amber-200", header: "from-amber-500 to-orange-500" },
  Q3: { badge: "bg-blue-100 text-blue-700 border-blue-200", header: "from-blue-500 to-indigo-500" },
  Q4: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", header: "from-emerald-500 to-teal-500" },
};

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 px-1 text-left hover:bg-slate-50 transition rounded"
      >
        <span className="font-semibold text-sm text-slate-700">{title}</span>
        {open
          ? <ChevronUp size={15} className="text-slate-400" />
          : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {open && <div className="pb-5 px-1">{children}</div>}
    </div>
  );
};

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, big5, label, quadrant }) => {
  const info = persona["基本情報"];
  const qs = QUADRANT_STYLES[quadrant] ?? { badge: "bg-slate-100 text-slate-600 border-slate-200", header: "from-slate-500 to-slate-600" };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className={`bg-gradient-to-r ${qs.header} px-6 py-5 text-white`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-black uppercase tracking-widest opacity-80">{label}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border bg-white/20 border-white/30 text-white`}>
            {quadrant}
          </span>
        </div>
        <p className="text-xl font-bold">
          {info.名前}
          <span className="text-white/70 font-normal text-sm ml-2">{info.年齢}歳 · {info.性別}</span>
        </p>
        <p className="text-sm text-white/80 mt-0.5">{info.職業} · {info.居住地} · {info.家族構成}</p>
      </div>

      <div className="px-6 pb-2">

        {/* === LAYER 1: WHO === */}
        <div className="pt-3 pb-1">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Layer 1 — WHO（誰か）</p>
        </div>

        <Section title="基本情報・ライフスタイル" defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "経済状況", value: info.経済状況 },
              { label: "教育", value: info.教育レベル },
              { label: "家族構成", value: info.家族構成 },
              { label: "居住地", value: info.居住地 },
              { label: "ライフスタイル", value: persona["サイコグラフィック情報"].ライフスタイル },
              { label: "価値観", value: persona["サイコグラフィック情報"].価値観 },
              { label: "趣味・興味", value: persona["サイコグラフィック情報"]["趣味・興味"] },
              { label: "パーソナリティ", value: persona["サイコグラフィック情報"].パーソナリティ },
            ].map(({ label: l, value }) => (
              <div key={l} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                <p className="text-xs font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="BIG5 性格診断" defaultOpen>
          <Big5Chart big5={big5} />
        </Section>

        <Section title="行動・メディア情報">
          <div className="space-y-1.5">
            {[
              { label: "購買行動の癖", value: persona["行動情報"].購買行動の癖 },
              { label: "情報収集方法", value: persona["行動情報"].情報収集方法 },
              { label: "使用デバイス", value: persona["行動情報"].使用デバイス },
              { label: "よく使うメディア", value: persona["行動情報"].よく使うメディア },
            ].map(({ label: l, value }) => (
              <div key={l} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                <p className="text-xs text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* === LAYER 2: HOW === */}
        <div className="pt-4 pb-1">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Layer 2 — HOW（どう反応するか）</p>
        </div>

        <Section title="人間科学4要素 — 認知・感情・行動・身体状態" defaultOpen>
          {persona["人間科学4要素"] && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">🧠 認知</p>
                <div className="space-y-1.5">
                  {[
                    { label: "理解していること", value: persona["人間科学4要素"].認知.理解していること },
                    { label: "誤解しやすいポイント", value: persona["人間科学4要素"].認知.誤解しやすいポイント },
                    { label: "難しいと感じる部分", value: persona["人間科学4要素"].認知.難しいと感じる部分 },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-100">
                      <p className="text-xs text-indigo-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">💭 感情</p>
                <div className="space-y-1.5">
                  {[
                    { label: "主要感情", value: persona["人間科学4要素"].感情.主要感情 },
                    { label: "感情が障壁になるシーン", value: persona["人間科学4要素"].感情.感情が障壁になるシーン },
                    { label: "感情を転換するきっかけ", value: persona["人間科学4要素"].感情.感情を転換するきっかけ },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                      <p className="text-xs text-rose-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">🎯 行動</p>
                <div className="space-y-1.5">
                  {[
                    { label: "実際の行動パターン", value: persona["人間科学4要素"].行動.実際の行動パターン },
                    { label: "言動のズレ", value: persona["人間科学4要素"].行動.言動のズレ },
                    { label: "行動変化のトリガー", value: persona["人間科学4要素"].行動.行動変化のトリガー },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                      <p className="text-xs text-amber-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">⚡ 身体状態</p>
                <div className="space-y-1.5">
                  {[
                    { label: "典型的な使用シーン", value: persona["人間科学4要素"].身体状態.典型的な使用シーン },
                    { label: "デバイスと操作環境", value: persona["人間科学4要素"].身体状態.デバイスと操作環境 },
                    { label: "集中力と余裕の状態", value: persona["人間科学4要素"].身体状態.集中力と余裕の状態 },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                      <p className="text-xs text-emerald-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* === LAYER 3: WHY NOT === */}
        <div className="pt-4 pb-1">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Layer 3 — WHY NOT（なぜ動かないか）</p>
        </div>

        <Section title="動かない理由分析 — 行動阻害の6要因" defaultOpen>
          {persona["動かない理由分析"] && (
            <div className="space-y-2">
              {[
                { label: "損失回避", icon: "💸", value: persona["動かない理由分析"].損失回避 },
                { label: "失敗回避", icon: "😰", value: persona["動かない理由分析"].失敗回避 },
                { label: "承認欲求", icon: "👁", value: persona["動かない理由分析"].承認欲求 },
                { label: "説明コスト", icon: "🗣", value: persona["動かない理由分析"].説明コスト },
                { label: "初回障壁", icon: "🚧", value: persona["動かない理由分析"].初回障壁 },
                { label: "自己認識ギャップ", icon: "🔍", value: persona["動かない理由分析"].自己認識ギャップ },
              ].map(({ label: l, icon, value }) => (
                <div key={l} className="flex gap-3 items-start bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-0.5">{l}</p>
                    <p className="text-xs text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* === LAYER 4: JOURNEY === */}
        <div className="pt-4 pb-1">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Layer 4 — JOURNEY（どう動くか）</p>
        </div>

        <Section title="目標・動機・課題">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-violet-500 mb-1.5">目標動機欲求</p>
              <div className="space-y-1.5">
                {[
                  { label: "短期欲求", value: persona["目標動機欲求"].短期欲求 },
                  { label: "長期欲求", value: persona["目標動機欲求"].長期欲求 },
                  { label: "動機", value: persona["目標動機欲求"].動機 },
                ].map(({ label: l, value }) => (
                  <div key={l} className="bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
                    <p className="text-xs text-violet-400 mb-0.5">{l}</p>
                    <p className="text-xs text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-500 mb-1.5">課題・ペインポイント</p>
              <div className="space-y-1.5">
                {[
                  { label: "現在の課題・悩み", value: persona["課題ペインポイント"]["現在の課題、悩み"] },
                  { label: "不満点", value: persona["課題ペインポイント"].不満点 },
                  { label: "障壁", value: persona["課題ペインポイント"].障壁 },
                ].map(({ label: l, value }) => (
                  <div key={l} className="bg-orange-50 rounded-lg px-3 py-2 border border-orange-100">
                    <p className="text-xs text-orange-400 mb-0.5">{l}</p>
                    <p className="text-xs text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
              <p className="text-xs text-slate-400 mb-0.5">意思決定の流れ</p>
              <p className="text-xs text-slate-700">{persona["意思決定プロセス"].意思決定の流れ}</p>
            </div>
            <div className="bg-slate-800 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-400 mb-0.5">購入ストーリー</p>
              <p className="text-xs text-white font-medium">{persona.購入理由}</p>
            </div>
          </div>
        </Section>

        <Section title="AIDMA 分析">
          <AIDMADisplay aidma={persona.AIDMA分析} />
        </Section>

        <Section title="カスタマージャーニー">
          <JourneyDisplay journey={persona.カスタマージャーニー} />
        </Section>

        <Section title="心理転換点">
          <TriggersDisplay triggers={persona.心理転換点} />
        </Section>

        {/* === LAYER 5: ACTION === */}
        <div className="pt-4 pb-1">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Layer 5 — ACTION（どう施策するか）</p>
        </div>

        <Section title="PDCA 施策">
          <PDCADisplay pdca={persona.PDCA施策} />
        </Section>

        <Section title="人間科学4要素 — 認知・感情・行動・身体状態">
          {persona["人間科学4要素"] && (
            <div className="space-y-4">
              {/* 認知 */}
              <div>
                <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">🧠 認知</p>
                <div className="space-y-1.5">
                  {[
                    { label: "理解していること", value: persona["人間科学4要素"].認知.理解していること },
                    { label: "誤解しやすいポイント", value: persona["人間科学4要素"].認知.誤解しやすいポイント },
                    { label: "難しいと感じる部分", value: persona["人間科学4要素"].認知.難しいと感じる部分 },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-100">
                      <p className="text-xs text-indigo-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* 感情 */}
              <div>
                <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">💭 感情</p>
                <div className="space-y-1.5">
                  {[
                    { label: "主要感情", value: persona["人間科学4要素"].感情.主要感情 },
                    { label: "感情が障壁になるシーン", value: persona["人間科学4要素"].感情.感情が障壁になるシーン },
                    { label: "感情を転換するきっかけ", value: persona["人間科学4要素"].感情.感情を転換するきっかけ },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                      <p className="text-xs text-rose-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* 行動 */}
              <div>
                <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">🎯 行動</p>
                <div className="space-y-1.5">
                  {[
                    { label: "実際の行動パターン", value: persona["人間科学4要素"].行動.実際の行動パターン },
                    { label: "言動のズレ", value: persona["人間科学4要素"].行動.言動のズレ },
                    { label: "行動変化のトリガー", value: persona["人間科学4要素"].行動.行動変化のトリガー },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                      <p className="text-xs text-amber-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* 身体状態 */}
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">⚡ 身体状態</p>
                <div className="space-y-1.5">
                  {[
                    { label: "典型的な使用シーン", value: persona["人間科学4要素"].身体状態.典型的な使用シーン },
                    { label: "デバイスと操作環境", value: persona["人間科学4要素"].身体状態.デバイスと操作環境 },
                    { label: "集中力と余裕の状態", value: persona["人間科学4要素"].身体状態.集中力と余裕の状態 },
                  ].map(({ label: l, value }) => (
                    <div key={l} className="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                      <p className="text-xs text-emerald-400 mb-0.5">{l}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        <Section title="動かない理由分析 — なぜ買わないか・続かないか">
          {persona["動かない理由分析"] && (
            <div className="space-y-2">
              {[
                { label: "損失回避", icon: "💸", value: persona["動かない理由分析"].損失回避 },
                { label: "失敗回避", icon: "😰", value: persona["動かない理由分析"].失敗回避 },
                { label: "承認欲求", icon: "👁", value: persona["動かない理由分析"].承認欲求 },
                { label: "説明コスト", icon: "🗣", value: persona["動かない理由分析"].説明コスト },
                { label: "初回障壁", icon: "🚧", value: persona["動かない理由分析"].初回障壁 },
                { label: "自己認識ギャップ", icon: "🔍", value: persona["動かない理由分析"].自己認識ギャップ },
              ].map(({ label: l, icon, value }) => (
                <div key={l} className="flex gap-3 items-start bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-0.5">{l}</p>
                    <p className="text-xs text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="データソース">
          <div className="space-y-3">
            {[
              { title: "1次データソース", data: persona.データソース["1次データソース"] },
              { title: "2次データソース", data: persona.データソース["2次データソース"] },
            ].map(({ title, data }) => (
              <div key={title}>
                <p className="text-xs font-bold text-slate-500 mb-1.5">{title}</p>
                <ul className="space-y-1">
                  {data?.map((d, i) => (
                    <li key={i} className="text-xs text-slate-500 flex gap-1.5 items-start">
                      <span className="text-violet-400 mt-0.5 flex-shrink-0">·</span>
                      {d.機関名}: {d.データ名} ({d.取得年})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default PersonaCard;
