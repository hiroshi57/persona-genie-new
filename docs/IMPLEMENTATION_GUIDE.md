# Persona Genie Pro - 実装・運用ガイド

## 📚 目次

1. [クイックスタート](#クイックスタート)
2. [ファイル構成の詳細](#ファイル構成の詳細)
3. [API連携について](#api連携について)
4. [カスタマイズ方法](#カスタマイズ方法)
5. [トラブルシューティング](#トラブルシューティング)
6. [本番環境デプロイ](#本番環境デプロイ)

---

## クイックスタート

### 5分でセットアップ

```bash
# 1. プロジェクトに移動
cd persona-genie-pro

# 2. 依存関係をインストール
npm install

# 3. .env.localにAPIキーを設定
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. 開発サーバーを起動
npm run dev

# 5. http://localhost:3000 にアクセス
```

---

## ファイル構成の詳細

### `src/types.ts` - 型定義

すべてのデータ構造を定義するファイルです。

```typescript
// 主な型
- ProductInfo: 商品情報
- PersonaDetails: ペルソナ詳細情報
- AIDMAAnalysis: AIDMA分析
- CustomerJourney: カスタマージャーニー
- PersonaResponse: 生成されたペルソナ3点
```

**カスタマイズポイント**:
- 新しいフィールドを追加する場合は、このファイルに型を追加してから、`App.tsx`と`geminiService.ts`で使用

### `src/geminiService.ts` - API連携

Google Gemini APIとの連携を管理します。

**重要な仕様**:
- ✅ 信頼性スコアは常に100（検証済みデータのみ）
- ✅ すべてのデータソースにURL付き
- ✅ 曖昧な予測は除外
- ✅ 日本語統計データを優先

**プロンプト構造**:
1. システムプロンプト：マーケティング戦略家のロール定義
2. 制約条件：100%検証済みデータのみ
3. 入力データ：商品情報
4. 出力形式：JSON
5. ペルソナパターン：3パターンの定義

**カスタマイズポイント**:
- `constructPrompt()`関数でプロンプトを編集
- データソースの優先順位を変更
- AIDMA段階の詳細度を調整

### `src/App.tsx` - メインUI

完全なアプリケーションUIを実装します。

**主なコンポーネント**:
- 入力フォーム: 商品情報の入力
- 結果表示: 3ペルソナの表示
- 6つのタブ: 異なる視点から分析

**コンポーネント関数**:

```typescript
// ファネル表示 (AIDMA)
<AIDMAFunnel data={data['AIDMA分析']} />

// ジャーニー表示
<JourneyVisualization data={data} />

// PDCA表示
<PDCAFlow data={data} />

// 心理転換点表示
<PsychologyTriggers data={data} />

// データソース表示
<DataSourceView data={data} />
```

**カスタマイズポイント**:
- 色の変更: `bg-indigo-600`, `from-indigo-500 to-purple-600`
- アイコンの追加: lucide-react から新しいアイコンをインポート
- レイアウトの調整: Tailwind クラスを編集
- テキストの翻訳: 日本語を別言語に変更

### `vite.config.ts` - ビルド設定

Viteのビルド設定ファイルです。

```typescript
// 環境変数の読み込み
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}

// ポート設定
server: { port: 3000, host: '0.0.0.0' }
```

**本番環境での変更**:
```typescript
// production フラグの追加
define: {
  'process.env.NODE_ENV': JSON.stringify('production')
}
```

---

## API連携について

### Google Gemini API の概要

```
モデル: gemini-2.5-flash
応答形式: JSON
最大トークン: 自動設定
タイムアウト: 30秒
```

### APIコスト

- **無料プラン**: 月60リクエスト
- **有料プラン**: 従量課金（詳細は公式ドキュメント参照）

### エラーハンドリング

```typescript
try {
  const result = await generatePersonas(productData);
  // 成功
} catch (error) {
  // API呼び出し失敗時
  // - APIキーが無効
  // - ネットワークエラー
  // - タイムアウト
}
```

### プロンプト最適化

プロンプトの質を向上させるための推奨事項：

1. **具体的な例を追加**
   ```typescript
   // Before
   "職業を設定してください"
   
   // After
   "職業を設定してください（例：営業、エンジニア、医師、教師）"
   ```

2. **制約条件を明確に**
   ```typescript
   "必ずURL付きで記述してください"
   "信頼性スコアは常に100にしてください"
   ```

3. **出力形式を指定**
   ```typescript
   "JSON形式のみで出力してください"
   "説明や追記は一切不要です"
   ```

---

## カスタマイズ方法

### 1. カラースキームの変更

**ファイル**: `src/App.tsx`

```typescript
// インディゴ系から別の色へ変更
// before
className="bg-indigo-600"

// after （例：ブルー系）
className="bg-blue-600"
```

**Tailwindカラーオプション**:
- slate / gray / zinc
- red / orange / amber
- yellow / lime / green
- cyan / blue / indigo
- purple / violet / pink

### 2. 新しい分析タブの追加

**手順**:
1. `types.ts` に新しい型を定義
2. `geminiService.ts` のプロンプトに追加
3. `App.tsx` に新しいタブコンポーネントを実装
4. タブナビゲーションに新しいボタンを追加

**例**:
```typescript
// types.ts に追加
interface NewAnalysis {
  "項目1": string;
  "項目2": string;
}

// App.tsx に追加
const NewAnalysisComponent: React.FC<{ data: NewAnalysis }> = ({ data }) => {
  return <div>{data['項目1']}</div>;
};

// タブに追加
{ id: 'newanalysis', label: '新分析', icon: '📊' }
```

### 3. データソースの拡張

**方法1: 新しいデータソースタイプを追加**

```typescript
// types.ts
interface DataSource {
  "1次データソース": string;
  "2次データソース": string;
  "3次データソース": string; // 新規追加
  "信頼性スコア": number;
  "データ根拠": string;
}
```

**方法2: プロンプトで指示**

```typescript
// geminiService.ts
"3次データソース: Googleトレンド、SNS分析など https://trends.google.co.jp"
```

### 4. 言語の変更（日本語→英語）

**ファイル**: `src/App.tsx` 全体

```typescript
// Before
<h2 className="text-4xl font-bold">検証済みデータから<span>ペルソナ</span>を構築</h2>

// After
<h2 className="text-4xl font-bold">Build <span>Personas</span> from Verified Data</h2>
```

**翻訳が必要な箇所**:
- タブラベル
- プレースホルダーテキスト
- エラーメッセージ
- ボタンテキスト

---

## トラブルシューティング

### 問題1: 「GEMINI_API_KEY is not set」エラー

**原因**: 環境変数が設定されていない

**解決方法**:
```bash
# .env.local を確認
cat .env.local

# ファイルがない場合は作成
echo "GEMINI_API_KEY=your_key_here" > .env.local

# サーバーを再起動
npm run dev
```

### 問題2: ペルソナ生成がタイムアウト

**原因**: API呼び出しが30秒以上かかっている

**解決方法**:
1. ネットワーク接続を確認
2. APIキーのレート制限を確認
3. 入力内容を簡潔にする
4. ブラウザコンソールでエラーメッセージを確認

### 問題3: ポート3000が使用中

**エラーメッセージ**:
```
EADDRINUSE: address already in use :::3000
```

**解決方法1**: 別のポートで起動
```bash
npm run dev -- --port 3001
```

**解決方法2**: 既存プロセスを終了
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 問題4: TypeScript エラー

**エラー**: `Property 'xxx' does not exist on type 'PersonaDetails'`

**解決方法**:
1. `types.ts` で型定義を確認
2. `geminiService.ts` のプロンプトで対応するキーが含まれているか確認
3. `App.tsx` でのアクセス方法を確認

### 問題5: URL が解析されない

**原因**: URL形式が無効（スペースやエスケープ文字が含まれている）

**確認方法**:
```typescript
// App.tsx の parseSourceText() を確認
// URL形式: https://domain.jp

// テスト用
const testUrl = "https://www.example.com/page";
console.log(shortenUrl(testUrl)); // example.com が出力されるはず
```

---

## 本番環境デプロイ

### Vercelへのデプロイ

**手順**:
```bash
# 1. 本番ビルド
npm run build

# 2. Vercelにログイン
vercel login

# 3. デプロイ
vercel

# 4. 環境変数を設定
# Vercelダッシュボード → Settings → Environment Variables
# GEMINI_API_KEY=your_key_here
```

### Netlifyへのデプロイ

**手順**:
```bash
# 1. 本番ビルド
npm run build

# 2. netlify CLIをインストール
npm install -g netlify-cli

# 3. デプロイ
netlify deploy --prod --dir=dist

# 4. 環境変数を設定
# Netlifyダッシュボード → Site settings → Build & deploy → Environment
```

### Docker でのデプロイ

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

**ビルドと実行**:
```bash
docker build -t persona-genie-pro .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key persona-genie-pro
```

### 環境変数の管理

**本番環境では必ず**:
- ✅ APIキーは環境変数で管理
- ✅ `.env.local` をコミットしない
- ✅ シークレット管理ツール（AWS Secrets Manager など）を使用

---

## パフォーマンス最適化

### ビルドサイズ の削減

```bash
# 現在のサイズを確認
npm run build
ls -lh dist/

# 最適化のチェックリスト
# □ 不要なライブラリを削除
# □ Tree shaking が有効か確認
# □ CSS の未使用クラスを削除（Tailwind purge）
```

### API レスポンス時間の改善

1. **プロンプトの簡潔化**
   - 不要な説明を削除
   - 具体的な例のみ残す

2. **キャッシング**
   ```typescript
   // 同じ入力データは結果をキャッシュ
   const cache = new Map();
   if (cache.has(JSON.stringify(productData))) {
     return cache.get(JSON.stringify(productData));
   }
   ```

3. **部分的な生成**
   - 3ペルソナを並列生成ではなく、順次生成を検討

---

## セキュリティチェックリスト

本番環境にデプロイする前に確認：

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] APIキーが完全に隠蔽されている
- [ ] すべてのURLが`rel="noopener noreferrer"`で開いている
- [ ] 入力値の検証が実装されている
- [ ] CSPヘッダーが設定されている（CDN利用時）
- [ ] HTTPS が有効
- [ ] セッション管理が実装されている（複数ユーザーの場合）

---

## 監視とログ

### エラートラッキング

```typescript
// エラーログの追加（本番環境）
try {
  const result = await generatePersonas(productData);
} catch (error) {
  console.error('ペルソナ生成失敗:', error);
  // Sentry、LogRocket などのサービスに送信
}
```

### ユーザー分析

```typescript
// Google Analytics の追加（オプション）
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

---

## FAQ

### Q: 複数ユーザーで同時利用できますか？
**A**: 現在のバージョンはシングルユーザー向けです。複数ユーザー対応には、バックエンド実装が必要です。

### Q: オフラインで使用できますか？
**A**: いいえ、Google Gemini API 呼び出しが必要なため、インターネット接続が必須です。

### Q: データは保存されますか？
**A**: いいえ、ローカルメモリのみ。ページをリロードするとリセットされます。

### Q: 商品情報の履歴は保存されますか？
**A**: 実装されていません。LocalStorage への保存機能を追加することが可能です。

### Q: APIコストはどのくらい？
**A**: Google Gemini API の無料プランは月60リクエスト。詳細は[公式ドキュメント](https://aistudio.google.com)を参照。

---

## 更新履歴

### v1.0.0 (2025-02-02)
- 初版リリース
- 3ペルソナ生成機能
- 6つの分析タブ
- データソース表示（URL付き）
- 100%検証済みデータ対応

---

## 関連リンク

- [Google Gemini API ドキュメント](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React 19 ドキュメント](https://react.dev)
- [Vite ドキュメント](https://vitejs.dev)

---

**最後の確認**: このドキュメントは常に最新に保つようにしてください。新機能追加時や仕様変更時は更新してください。
