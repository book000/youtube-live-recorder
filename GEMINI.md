# Gemini CLI 作業方針

## 目的

このドキュメントは、Gemini CLI がこのプロジェクトで作業を行う際のコンテキストと作業方針を定義します。Gemini CLI は、最新の外部情報（SaaS 仕様、言語・ランタイムのバージョン差、料金・制限・クォータなど）が必要な判断を担当します。

## 出力スタイル

- **言語**: 日本語
- **トーン**: 技術的かつ明確
- **形式**: 構造化されたマークダウン形式で、見出しとリストを活用

## 共通ルール

- **会話言語**: 日本語
- **コード内コメント**: 日本語（JSDoc など）
- **エラーメッセージ**: 英語
- **日本語と英数字の間**: 半角スペースを挿入
- **コミット規約**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は日本語で記載
  - 例: `feat: Discord 通知機能を追加`

## プロジェクト概要

- **目的**: YouTube ライブ動画を自動録画・ダウンロードする Docker ベースのアプリケーション
- **主な機能**:
  - YouTube ライブストリームの自動録画（チャンネル・プレイリスト指定）
  - タイトルフィルタリング（正規表現）
  - 動画品質選択（ベスト動画+ベスト音声）
  - MP4 形式への自動変換
  - Discord Webhook 通知
  - 定期的なヘルスチェック
  - Renovate による自動依存関係更新

## コーディング規約

- **フォーマット**: Prettier（`.prettierrc.yml`）に従う
- **命名規則**: キャメルケース（JavaScript/TypeScript 標準）
- **コメント言語**: 日本語（JSDoc を含む）
- **エラーメッセージ言語**: 英語
- **TypeScript**: `skipLibCheck` での回避は禁止
- **ドキュメント**: 関数とインターフェースに JSDoc を日本語で記載

## 技術スタック

- **言語**: TypeScript 5.9.3
- **ランタイム**: Node.js 24.13.0
- **パッケージマネージャー**: Yarn 1.22.22
- **コンテナ**: Docker + Docker Compose
- **外部ツール**: yt-dlp 2025.12.08, ffmpeg
- **HTTP クライアント**: axios（ランタイム依存）
- **開発ツール**: ts-node 10.9.2, ts-node-dev 2.0.0
- **Lint/Format**: ESLint 9.39.2, Prettier 3.8.1

## 開発コマンド

### Node.js アプリケーション（watch-new-movie/）

```bash
# 依存関係のインストール
cd watch-new-movie
yarn install

# 開発モード（自動リロード）
yarn dev

# アプリケーション実行（ts-node でソースコードを直接実行）
yarn build

# コンパイル済みコードを実行
yarn start

# ビルド（TypeScript をコンパイル）
yarn compile

# TypeScript コンパイルチェック（出力なし）
yarn compile:test

# Lint 実行（Prettier + ESLint + TypeScript）
yarn lint

# 自動修正（Prettier + ESLint）
yarn fix
```

### Docker

```bash
# ビルド・起動
docker compose up --build

# バックグラウンドで起動
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down
```

## 注意事項

- **認証情報のコミット禁止**: API キーや認証情報を Git にコミットしない。`recorder.env` と `discord-deliver.env` は `.gitignore` に含める。
- **ログへの機密情報出力禁止**: 個人情報や認証情報をログに出力しない。
- **既存ルールの優先**: プロジェクト固有のコーディング規約や Lint/Format ルールを優先する。
- **Renovate PR の扱い**: Renovate が作成した既存の PR に対して、追加コミットや更新を行わない。

## 既知の制約

- **テストフレームワーク**: 現在未設定。品質保証は TypeScript 厳格モード、ESLint、Prettier、GitHub Actions CI により実施。
- **Node.js バージョン固定**: `watch-new-movie/.node-version` で 24.13.0 に固定。
- **yt-dlp バージョン管理**: `Dockerfile` の ENV コメントで Renovate が管理（現在 2025.12.08）。

## リポジトリ固有

- **モノレポ構造**: 2 つのサービス（`recorder`, `watch-new-movie`）＋外部依存サービス（`discord-deliver` Docker イメージ）
- **Docker Hub デプロイ**: 2 つのイメージ
  - `book000/youtube-live-recorder` - Python/Bash 録画サービス
  - `book000/youtube-live-recorder-watch-new-movie` - Node.js 通知サービス
- **GitHub Actions ワークフロー**:
  - `nodejs-ci.yml` - Node.js CI（book000/templates の再利用可能ワークフローを使用）
  - `docker.yml` - Docker イメージビルド
  - `shell-ci.yml` - Shellcheck 検証
  - `hadolint-ci.yml` - Dockerfile Lint 検証
  - `add-reviewer.yml` - 自動レビュアー割り当て
- **環境設定ファイル**:
  - `recorder.env` - 録画対象設定（TARGET, CHANNEL/PLAYLIST, TITLE_FILTER）
  - `discord-deliver.env` - Discord 通知設定
- **watch-new-movie の動作**:
  - `/data/` ディレクトリの MP4 ファイルを監視
  - 中間フォーマットファイル（.f140, .f248, .f299）を除外
  - `/data/notified.json` で通知済み状態を管理
  - 初回実行時は通知をスキップ（初期化モード）
  - ダウンロード成功時は緑色（0x00ff00）、エラー時は赤色（0xff0000）の Discord Embed

## Gemini CLI の役割

Gemini CLI は、以下のような外部依存の判断を担当します：

- **最新の YouTube API 仕様**: yt-dlp や YouTube の仕様変更に関する最新情報
- **Discord Webhook 仕様**: Discord API の最新仕様、制限、クォータ
- **Node.js/TypeScript のバージョン互換性**: 新しいバージョンの機能や破壊的変更
- **Docker/Docker Compose の最新機能**: コンテナ化に関する最新のベストプラクティス
- **外部ツールのバージョン**: yt-dlp, ffmpeg の最新バージョンや既知の問題
- **SaaS の料金・制限**: Docker Hub、GitHub Actions の制限やクォータ

判断を下す際は、以下の項目を明示してください：

1. **情報源**: どこから情報を取得したか（公式ドキュメント、リリースノートなど）
2. **情報の日付**: 情報がいつのものか
3. **不確実性**: 情報の信頼性や不確実な要素
4. **推奨事項**: 具体的な推奨アクション
