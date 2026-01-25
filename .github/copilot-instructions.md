# GitHub Copilot Instructions

## プロジェクト概要

- 目的: YouTube ライブ動画を自動録画・ダウンロードする Docker ベースのアプリケーション
- 主な機能:
  - YouTube ライブストリームの自動録画（チャンネル・プレイリスト指定）
  - タイトルフィルタリング（正規表現）
  - 動画品質選択（ベスト動画+ベスト音声）
  - MP4 形式への自動変換
  - Discord Webhook 通知
  - 定期的なヘルスチェック
- 対象ユーザー: 開発者、YouTube ライブ録画を自動化したいユーザー

## 共通ルール

- 会話は日本語で行う。
- コード内のコメントは日本語で記載する。
- エラーメッセージは英語で記載する。
- 日本語と英数字の間には半角スペースを挿入する。
- コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う。
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は日本語で記載
  - 例: `feat: ユーザー認証機能を追加`
- ブランチ命名は [Conventional Branch](https://conventional-branch.github.io) に従う。
  - 形式: `<type>/<description>`
  - `<type>` は短縮形（feat, fix, docs など）を使用
  - 例: `feat/add-user-auth`

## 技術スタック

- 言語: TypeScript 5.9.3
- ランタイム: Node.js 24.13.0
- パッケージマネージャー: Yarn 1.22.22
- コンテナ: Docker + Docker Compose
- 外部ツール: yt-dlp 2025.12.08, ffmpeg
- HTTP クライアント: axios（ランタイム依存）
- 開発ツール: ts-node 10.9.2, ts-node-dev 2.0.0
- Lint/Format: ESLint 9.39.2, Prettier 3.8.1
- ESLint 共有設定: @book000/eslint-config 1.12.40

## コーディング規約

- TypeScript の `skipLibCheck` を有効にして回避することは禁止
- 関数とインターフェースには JSDoc コメントを日本語で記載する
- エラーメッセージには先頭に絵文字を付ける（エラー内容に即した 1 文字）
- フォーマット: Prettier（`.prettierrc.yml` に従う）
- Lint: ESLint（`eslint.config.mjs` に従う）
- 厳格な TypeScript 型チェック（`tsconfig.json` の strict モード）

## 開発コマンド

プロジェクトのルートで以下のコマンドを実行します。Node.js アプリケーションは `watch-new-movie/` ディレクトリにあります。

```bash
# 依存関係のインストール
cd watch-new-movie
yarn install

# 開発モード（自動リロード）
yarn dev

# ビルド
yarn build

# アプリケーション実行（ts-node 経由、本番相当設定）
yarn build

# コンパイル済みコードを実行
yarn start

# TypeScript をコンパイルしてビルド（完全チェック）
yarn compile

# TypeScript コンパイルチェック（出力なし）
yarn compile:test

# Lint 実行（Prettier + ESLint + TypeScript）
yarn lint

# Prettier チェック
yarn lint:prettier

# ESLint チェック
yarn lint:eslint

# TypeScript コンパイルチェック
yarn lint:tsc

# 自動修正（Prettier + ESLint）
yarn fix

# Prettier 自動修正
yarn fix:prettier

# ESLint 自動修正
yarn fix:eslint
```

### Docker コマンド

```bash
# Docker Compose でビルド・起動
docker compose up --build

# バックグラウンドで起動
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down
```

## テスト方針

- テストフレームワーク: 未設定（現在はテストなし）
- 品質保証方法:
  - TypeScript 厳格モードによる型チェック
  - ESLint + Prettier による静的解析
  - GitHub Actions CI による自動検証
  - Docker 環境での手動検証
- 新機能を追加する場合:
  - TypeScript の型安全性を確保する
  - Lint/Format エラーがないことを確認する
  - CI が成功することを確認する

## セキュリティ / 機密情報

- API キーや認証情報を Git にコミットしない。
- `recorder.env` と `discord-deliver.env` は `.gitignore` に含める。
- ログに個人情報や認証情報を出力しない。
- Discord Webhook URL は環境変数で管理する。

## ドキュメント更新

コード変更時には以下のドキュメントを適宜更新する：

- `README.md` - 主な機能や使用方法の変更時
- `watch-new-movie/package.json` - 依存関係やスクリプトの変更時
- `docker-compose.yml` - サービス構成の変更時
- `.node-version` - Node.js バージョンの変更時
- このファイル（`.github/copilot-instructions.md`） - 開発プロセスやルールの変更時

## リポジトリ固有

- このプロジェクトは Docker Hub にデプロイされる（`book000/youtube-live-recorder` および `book000/youtube-live-recorder-watch-new-movie`）。
- Renovate による自動依存関係更新が有効。Renovate が作成した PR に対して追加コミットや更新を行わない。
- モノレポ構造: `recorder`（Python/Bash）、`watch-new-movie`（Node.js）、`discord-deliver`（Docker コンテナサービス）の 3 サービス。
- Node.js バージョンは `.node-version` で固定（24.13.0）。
- yt-dlp のバージョンは `Dockerfile` の ENV コメントで Renovate が管理。
- GitHub Actions ワークフロー:
  - `nodejs-ci.yml` - Node.js CI（book000/templates の再利用可能ワークフローを使用）
  - `docker.yml` - Docker イメージビルド
  - `shell-ci.yml` - Shellcheck 検証
  - `hadolint-ci.yml` - Dockerfile Lint 検証
  - `add-reviewer.yml` - 自動レビュアー割り当て
- 環境設定ファイル:
  - `recorder.env` - 録画対象設定（TARGET, CHANNEL/PLAYLIST, TITLE_FILTER）
  - `discord-deliver.env` - Discord 通知設定
- watch-new-movie アプリケーションのロジック:
  - `/data/` ディレクトリの MP4 ファイルを監視
  - 中間フォーマットファイル（.f140, .f248, .f299）を除外
  - `/data/notified.json` で通知済み状態を管理
  - 初回実行時は通知をスキップ（初期化モード）
  - ダウンロード成功時は緑色（0x00ff00）、エラー時は赤色（0xff0000）の Discord Embed を送信
