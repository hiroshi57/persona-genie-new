# Persona Genie Pro - クイックスタートガイド ⚡

**目標: 5分でアプリケーションを起動**

---

## 📋 前提条件チェック

以下がインストールされているか確認してください：

- [ ] Node.js 18以上（確認: `node -v`）
- [ ] npm 9以上（確認: `npm -v`）
- [ ] Google Gemini API キー（[こちらから取得](https://aistudio.google.com)）

---

## 🚀 セットアップ手順（5分）

### ステップ1: プロジェクトを展開（1分）

```bash
# Zipファイルを解凍
unzip persona-genie-pro.zip

# プロジェクトフォルダに移動
cd persona-genie-pro

# 確認
ls -la
```

### ステップ2: 依存関係をインストール（2分）

```bash
npm install
```

**期待される出力**:
```
added 150 packages in 45s
```

### ステップ3: 環境変数を設定（1分）

**.env.local ファイルを編集**:

```bash
# macOS/Linux
nano .env.local

# Windows (PowerShell)
notepad .env.local
```

**内容**:
```
GEMINI_API_KEY=your_api_key_here
```

↓ `your_api_key_here` を実際のAPIキーに置き換え ↓

### ステップ4: 開発サーバーを起動（1分）

```bash
npm run dev
```

**期待される出力**:
```
  VITE v6.4.1  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  Press h + enter to show help
```

### ステップ5: ブラウザで確認（自動）

```
http://localhost:3000
```

🎉 **完成！アプリケーション起動完了**

---

## ✅ 動作確認チェックリスト

起動後、以下を確認してください：

- [ ] ページが表示される（ヘッダー「Persona Genie Pro」が見える）
- [ ] フォーム入力欄が表示される
- [ ] 各入力欄（商品名、カテゴリーなど）が表示される
- [ ] 「ペルソナを生成する」ボタンが表示される

### テストデータで試す

```
商品名: スマートウォッチ
カテゴリー: ウェアラブル
発売日: 2024年10月
価格: ¥29,800
販売チャネル: Amazon、楽天
```

フォームを埋めて「生成」をクリック → 30秒で結果が表示

---

## 🆘 よくあるエラーと解決方法

### ❌ エラー: `GEMINI_API_KEY is not set`

**原因**: 環境変数が設定されていない

**解決**:
```bash
# 確認
cat .env.local

# 再設定
echo "GEMINI_API_KEY=your_key_here" > .env.local

# サーバー再起動
# ターミナルで Ctrl+C を押して、npm run dev で再起動
```

### ❌ エラー: `Port 3000 already in use`

**原因**: 別のプロセスがポート3000を使用中

**解決1**:
```bash
npm run dev -- --port 3001
```

**解決2** (既存プロセスを終了):
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ❌ エラー: `npm: command not found`

**原因**: Node.jsがインストールされていない

**解決**:
1. [nodejs.org](https://nodejs.org) からインストール
2. ターミナルを再起動
3. `npm run dev` 再実行

### ❌ エラー: `Cannot find module 'react'`

**原因**: `npm install` が完了していない

**解決**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📂 ファイル構造の確認

セットアップ後、以下のファイルが存在することを確認：

```
persona-genie-pro/
├── src/
│   ├── App.tsx ..................... ✓ 必須
│   ├── geminiService.ts .......... ✓ 必須
│   ├── types.ts .................... ✓ 必須
│   └── index.tsx ................... ✓ 必須
├── index.html ....................... ✓ 必須
├── .env.local ....................... ✓ 必須（APIキー設定）
├── package.json .................... ✓ 必須
├── tsconfig.json ................... ✓ 必須
├── vite.config.ts .................. ✓ 必須
├── README.md ....................... 📖 マニュアル
└── IMPLEMENTATION_GUIDE.md ....... 📖 詳細ガイド
```

---

## 🎯 次のステップ

### 基本的な使い方

1. **ブラウザで** `http://localhost:3000` を開く
2. **商品情報を入力** （商品名とカテゴリーは必須）
3. **「ペルソナを生成する」をクリック**
4. **30秒待機** (APIが処理中)
5. **ペルソナを確認** (3パターンA/B/C)
6. **タブで詳細確認** (AIDMA、ジャーニーなど)

### より詳しく知りたい場合

- 📖 **README.md** - プロジェクト概要と機能説明
- 🛠️ **IMPLEMENTATION_GUIDE.md** - カスタマイズ方法
- 📋 **PROMPT_SPECIFICATION.md** - プロンプト仕様書

---

## 🔑 Google Gemini API キーの取得

**所要時間: 2分**

### 方法1: Web UI（推奨）

1. [Google AI Studio](https://aistudio.google.com) にアクセス
2. 「API キーを取得」をクリック
3. 「新しいプロジェクト」を選択
4. 「キーを生成」をクリック
5. APIキーをコピー
6. `.env.local` に貼り付け

### 方法2: Google Cloud Console（詳細設定が必要な場合）

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成
3. Gemini API を有効化
4. APIキーを生成
5. `.env.local` に貼り付け

---

## 💡 Tips

### Ctrl+Shift+I で開発者ツールを開く

```
ネットワークエラー → 「Network」タブで確認
JavaScriptエラー → 「Console」タブで確認
```

### ホットリロード

ファイルを保存すると、自動的にブラウザがリロード（`npm run dev`実行中）

### ターミナルのショートカット

```
npm run dev を実行中:

[h + Enter]  ........... ヘルプ表示
[q]  .................. サーバー停止
```

---

## 📞 トラブルシューティング

### よくある質問

**Q: API呼び出しが遅い場合はどうする？**
```
A: 数秒待つか、APIキーのレート制限を確認してください
```

**Q: ペルソナが同じ内容ばかり出力される**
```
A: 入力内容（商品情報）を詳しく書いて、再度実行してください
```

**Q: エラーメッセージがよくわからない**
```
A: README.md → IMPLEMENTATION_GUIDE.md の順で参照してください
```

---

## 🎓 学習リソース

### コード理解

| ファイル | 学習内容 | 難易度 |
|--------|--------|------|
| `types.ts` | TypeScript型定義 | 初級 |
| `App.tsx` | React コンポーネント | 中級 |
| `geminiService.ts` | API連携 | 中級 |

### 詳細ドキュメント

- **README.md** → 機能説明
- **IMPLEMENTATION_GUIDE.md** → カスタマイズ方法
- **PROMPT_SPECIFICATION.md** → AIプロンプト仕様

---

## 📝 よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果をプレビュー
npm run preview

# 依存関係を更新
npm install

# 特定のポートで起動
npm run dev -- --port 3001
```

---

## ✨ トラブル時のリセット

```bash
# 1. サーバーを停止 (Ctrl+C)

# 2. node_modules を削除
rm -rf node_modules package-lock.json

# 3. 再インストール
npm install

# 4. 環境変数確認
cat .env.local

# 5. 再起動
npm run dev
```

---

## 📊 動作確認テスト

### テスト用入力データ

```
【テストケース1: シンプル】
商品名: イヤホン
カテゴリー: オーディオ
発売日: 2024年11月
価格: ¥3,980
販売チャネル: Amazon
特徴（外観）: コンパクト
特徴（機能）: ノイズキャンセリング
特徴（コンセプト）: 日常使い向け
顧客イメージ: 通勤・通学の若年層
ニーズ: 音質とコスパの両立
ソリューション: 高機能な低価格イヤホン

【テストケース2: 詳細】
（上記に加えて詳しい説明を記入）
```

**期待される出果**:
```
✅ 3つのペルソナ（A/B/C）が生成される
✅ 各ペルソナに名前が付いている
✅ データソースにURLが記載されている
✅ 信頼性スコアが100%と表示される
```

---

## 🎉 セットアップ完了のサイン

```
□ ブラウザで http://localhost:3000 が表示される
□ 「Persona Genie Pro」というタイトルが見える
□ フォーム入力欄が表示される
□ 「ペルソナを生成する」ボタンが表示される
□ テストデータを入力して「生成」がクリックできる
```

すべてチェック済み → **セットアップ完了！** 🚀

---

## 📞 サポートが必要な場合

1. **README.md** を読む（全体像の理解）
2. **IMPLEMENTATION_GUIDE.md** を読む（カスタマイズ方法）
3. **PROMPT_SPECIFICATION.md** を読む（プロンプト仕様）
4. ブラウザの開発者ツール（F12）でエラーを確認

---

**Happy Persona Building! 🎊**

*最終更新: 2025-02-02*
