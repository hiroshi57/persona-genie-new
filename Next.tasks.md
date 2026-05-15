# Next Tasks - persona-genie-new

最終更新: 2026-04-18（全タスク完了）

---

## ✅ 完了済み（全件）

- [x] 旧バージョンファイルを `archive/` に退避（v9/v10/improved 等）
- [x] `@anthropic-ai/sdk` / `@google/genai` → fetch API に置換
- [x] `process.env` → `import.meta.env` に修正・`tsconfig.json` vite/client 追加
- [x] `simulationCore.ts`: `gaussianRandom` NaN バグ修正
- [x] `big5Engine.ts`: `digitalLiteracy` undefined NaN バグ修正
- [x] `claudeService.ts`: `content[0]` undefined・`JSON.parse` 安全化
- [x] `simulationWorker.ts` / `useSimulationWorker.ts`: null ガード追加
- [x] `PersonaTab.tsx` / `AnalysisView.tsx`: `setPersonas` 型定義統一
- [x] **Task1**: APIキーをバックエンドへ（`api/claude.ts`, `api/gemini.ts` + vite プロキシ）
- [x] **Task2**: 入力バリデーション強化（`validation.ts`・文字数制限・サニタイズ）
- [x] **Task3**: Toastエラー通知（`Toast.tsx`・`useToast`・3秒自動消去）
- [x] **Task4**: レート制限（ペルソナ生成ボタン 30秒クールダウン）
- [x] **Task5**: sessionStorage キャッシュ（`personaCache.ts`）
- [x] **Task6**: エクスポート機能（`ExportButton.tsx`・JSON / CSV / PDF印刷）
- [x] **Task7**: InputForm 型アサーション安全化（型ガード関数に置換）
- [x] **Task8**: React key をインデックス → 安定IDに変更
- [x] **Task9**: Vitest ユニットテスト追加（10件全パス）
- [x] **Task10**: `useMemo` / `useCallback` によるパフォーマンス最適化
- [x] TypeScript ビルド エラーゼロ・テスト全パス確認済み

---

## 📝 今後の発展候補（スコープ外）

- Vercel へのデプロイ（`api/` ディレクトリがそのまま Serverless Functions になる）
- `.env` に `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` を設定して本番動作確認
- PDF エクスポートの高品質化（`html2pdf.js` 等の導入）
- E2E テスト（Playwright）
