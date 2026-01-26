# Claude Code 作業方針

## 目的

このドキュメントは、Claude Code がこのプロジェクトで作業を行う際の方針とプロジェクト固有のルールを定義します。

## 判断記録のルール

Claude Code は、すべての判断を以下の形式で記録する必要があります：

1. **判断内容の要約**: 何を決定したか
2. **検討した代替案**: 考慮した他の選択肢
3. **採用しなかった案とその理由**: なぜ他の案を選ばなかったか
4. **前提条件・仮定・不確実性**: 判断の基礎となる前提や仮定
5. **他エージェントによるレビュー可否**: 他のエージェントがレビュー可能か

**重要**: 前提・仮定・不確実性を明示すること。仮定を事実のように扱ってはならない。

## プロジェクト概要

- **目的**: YouTube ライブ動画を自動録画・ダウンロードする Docker ベースのアプリケーション
- **主な機能**:
  - YouTube ライブストリームの自動録画（チャンネル・プレイリスト指定）
  - タイトルフィルタリング（正規表現による動画選別）
  - 動画品質選択（ベスト動画+ベスト音声）
  - MP4 形式への自動変換
  - Discord Webhook 通知（ダウンロード完了時）
  - 定期的なヘルスチェック
  - Renovate による自動依存関係更新

## 重要ルール

- **会話言語**: 日本語
- **コード内コメント**: 日本語（JSDoc を含む）
- **エラーメッセージ**: 英語
- **日本語と英数字の間**: 半角スペースを挿入
- **コミットメッセージ**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 形式
  - `<type>(<scope>): <description>`（`<description>` は日本語）
  - 例: `feat: Discord 通知機能を追加`

## 環境のルール

- **ブランチ命名**: [Conventional Branch](https://conventional-branch.github.io) 形式
  - `<type>/<description>`（`<type>` は短縮形）
  - 例: `feat/discord-notification`
- **GitHub リポジトリ調査**: テンポラリディレクトリに `git clone` して検索
- **Renovate PR の扱い**: Renovate が作成した既存の PR に対して、追加コミットや更新を行わない

## Git Worktree

現在は使用していませんが、採用する場合は以下の構成にします：

```
.bare/
<ブランチ名>/
```

例:

```
.bare/              # bare リポジトリ（隠しディレクトリ）
master/             # master ブランチの worktree
develop/            # develop ブランチの worktree
feat/
  new-feature/      # feat/new-feature ブランチの worktree
```

## コード改修時のルール

- **日本語と英数字の間**: 半角スペースを挿入する
- **エラーメッセージの絵文字**: 既存のエラーメッセージに絵文字がある場合、全体で統一する（エラー内容に即した 1 文字の絵文字）
- **TypeScript の `skipLibCheck`**: 有効にして回避することは絶対にしない
- **docstring（JSDoc）**: 関数とインターフェースに日本語で記載・更新する

## 相談ルール

他エージェントに相談することができます。以下の観点で使い分けてください：

### Codex CLI (ask-codex)

- 実装コードに対するソースコードレビュー
- 関数設計、モジュール内部の実装方針などの局所的な技術判断
- アーキテクチャ、モジュール間契約、パフォーマンス/セキュリティといった全体影響の判断
- 実装の正当性確認、機械的ミスの検出、既存コードとの整合性確認

### Gemini CLI (ask-gemini)

- SaaS 仕様、言語・ランタイムのバージョン差、料金・制限・クォータといった、最新の適切な情報が必要な外部依存の判断
- 外部一次情報の確認、最新仕様の調査、外部前提条件の検証

### 指摘への対応ルール

他エージェントが指摘・異議を提示した場合、Claude Code は必ず以下のいずれかを行う。**黙殺・無言での不採用は禁止**。

- 指摘を受け入れ、判断を修正する
- 指摘を退け、その理由を明示する

以下は必ず実施してください：

- 他エージェントの提案を鵜呑みにせず、その根拠や理由を理解する
- 自身の分析結果と他エージェントの意見が異なる場合は、双方の視点を比較検討する
- 最終的な判断は、両者の意見を総合的に評価した上で、自身で下す

## 開発コマンド

### Node.js アプリケーション（watch-new-movie/）

```bash
# 依存関係のインストール
yarn install

# 開発モード（自動リロード）
yarn dev

# アプリケーション実行（ts-node でソースコードを直接実行）
yarn build

# コンパイル済みコードを実行
yarn start

# TypeScript コンパイル（完全チェック）
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

## アーキテクチャと主要ファイル

### アーキテクチャサマリー

- **モノレポ構造**: 2 つのサービス（`recorder`, `watch-new-movie`）＋外部依存サービス（`discord-deliver` Docker イメージ）
  - `recorder`（Python/Bash）: yt-dlp と ffmpeg を使用した録画サービス
  - `watch-new-movie`（Node.js/TypeScript）: 録画完了を検知し Discord 通知
  - `discord-deliver`（Discord メッセージ配信用 Docker コンテナサービス）: 外部 Docker イメージとして利用、本リポジトリにはソースコードは含まれない
- **Docker Compose** でオーケストレーション
- **GitHub Actions** で CI/CD を自動化

### 主要ディレクトリ

```
youtube-live-recorder/
├── .github/
│   └── workflows/           # CI/CD ワークフロー
├── watch-new-movie/
│   ├── src/
│   │   └── main.ts         # メインアプリケーション
│   ├── dist/               # コンパイル済み JavaScript
│   ├── package.json        # Node.js 依存関係
│   ├── tsconfig.json       # TypeScript 設定
│   ├── eslint.config.mjs   # ESLint 設定
│   ├── .prettierrc.yml     # Prettier 設定
│   ├── .node-version       # Node.js バージョン固定
│   ├── Dockerfile          # Node.js アプリ用 Dockerfile
│   └── entrypoint.sh       # コンテナエントリーポイント
├── Dockerfile              # Python ベース録画用 Dockerfile
├── docker-compose.yml      # Docker Compose 設定
├── entrypoint.sh           # 録画サービスエントリーポイント
├── renovate.json           # Renovate 設定
└── README.md               # プロジェクトドキュメント
```

### 主要ファイルの役割

- **watch-new-movie/src/main.ts**: Discord 通知ロジック
  - `getMovies()`: `/data/` ディレクトリから MP4 ファイルをスキャン
  - `main()`: 新規動画を検知し Discord Webhook を送信
  - 中間フォーマットファイル（.f140, .f248, .f299）を除外
  - `/data/notified.json` で通知済み状態を管理
  - 初回実行時は通知をスキップ（初期化モード）

## 実装パターン

### 推奨パターン

- TypeScript の厳格な型チェックを活用
- JSDoc コメントで関数とインターフェースを文書化
- エラーハンドリングは Discord 通知を含める
- 環境変数で設定を管理（ハードコードしない）
- Docker イメージはマルチステージビルドを使用

### 非推奨パターン

- `skipLibCheck` を有効にして型エラーを回避
- 型定義なしでコードを記述
- ハードコードされた設定値
- センシティブな情報をログに出力

## テスト

### テスト方針

- **現状**: テストフレームワークは未設定
- **品質保証**:
  - TypeScript 厳格モードによる型チェック
  - ESLint + Prettier による静的解析
  - GitHub Actions CI による自動検証
  - Docker 環境での手動検証

### 新規コード追加時のテスト条件

- TypeScript の型安全性を確保する
- `yarn lint` でエラーがないことを確認する
- `yarn compile:test` でコンパイルエラーがないことを確認する
- Docker Compose で動作確認を行う
- GitHub Actions CI が成功することを確認する

## ドキュメント更新ルール

### 更新対象

- `README.md` - 主な機能や使用方法の変更時
- `watch-new-movie/package.json` - 依存関係やスクリプトの変更時
- `docker-compose.yml` - サービス構成の変更時
- `watch-new-movie/.node-version` - Node.js バージョンの変更時
- `.github/copilot-instructions.md` - 開発プロセスやルールの変更時
- このファイル（`CLAUDE.md`） - 作業方針やルールの変更時

### 更新タイミング

- 機能追加や変更を行った際に即座に更新
- API や設定項目を変更した際に即座に更新
- 環境変数を追加・変更した際に即座に更新

## 作業チェックリスト

### 新規改修時

1. プロジェクトについて詳細に探索し理解すること
2. 作業を行うブランチが適切であること。すでに PR を提出しクローズされたブランチでないこと
3. 最新のリモートブランチに基づいた新規ブランチであること
4. PR がクローズされ、不要となったブランチは削除されていること
5. プロジェクトで指定されたパッケージマネージャ（Yarn）により、依存パッケージをインストールしたこと

### コミット・プッシュする前

1. コミットメッセージが [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従っていること（`<description>` は日本語）
2. コミット内容にセンシティブな情報が含まれていないこと
3. Lint / Format エラーが発生しないこと（`yarn lint` でチェック）
4. 動作確認を行い、期待通り動作すること

### プルリクエストを作成する前

1. プルリクエストの作成をユーザーから依頼されていること
2. コミット内容にセンシティブな情報が含まれていないこと
3. コンフリクトする恐れが無いこと

### プルリクエストを作成したあと

プルリクエストを作成したあとは、以下を必ず実施する。PR 作成後のプッシュ時に毎回実施。時間がかかる処理が多いため、Task を使って並列実行すること。

1. コンフリクトが発生していないこと
2. PR 本文の内容は、ブランチの現在の状態を、今までのこの PR での更新履歴を含むことなく、最新の状態のみ、漏れなく日本語で記載されていること。この PR を見たユーザーが、最終的にどのような変更を含む PR なのかをわかりやすく、細かく記載されていること
3. `gh pr checks <PR ID> --watch` で GitHub Actions CI を待ち、その結果がエラーとなっていないこと。成功している場合でも、ログを確認し、誤って成功扱いになっていないこと。もし GitHub Actions が動作しない場合は、ローカルで CI と同等のテストを行い、CI が成功することを保証しなければならない
4. `request-review-copilot` コマンドが存在する場合、`request-review-copilot https://github.com/$OWNER/$REPO/pull/$PR_NUMBER` で GitHub Copilot へレビューを依頼すること。レビュー依頼は自動で行われる場合もあるし、制約により `request-review-copilot` を実行しても GitHub Copilot がレビューしないケースがある
5. 10 分以内に投稿される GitHub Copilot レビューへの対応を行うこと。対応したら、レビューコメントそれぞれに対して返信を行うこと。レビュアーに GitHub Copilot がアサインされていない場合はスキップして構わない
6. `/code-review:code-review` によるコードレビューを実施したこと。コードレビュー内容に対しては、**スコアが 50 以上の指摘事項** に対して対応すること（80 がボーダーラインではない）

## リポジトリ固有

- **Docker Hub デプロイ**: `book000/youtube-live-recorder` と `book000/youtube-live-recorder-watch-new-movie` の 2 つのイメージ
- **Renovate**: 自動依存関係更新が有効。Renovate が作成した PR に対して追加コミットや更新を行わない
- **Node.js バージョン固定**: `watch-new-movie/.node-version` で 24.13.0 に固定
- **yt-dlp バージョン管理**: `Dockerfile` の ENV コメントで Renovate が管理（現在 2025.12.08）
- **GitHub Actions ワークフロー**:
  - `nodejs-ci.yml` - book000/templates の再利用可能ワークフローを使用
  - `docker.yml` - 両方の Docker イメージをビルド
  - `shell-ci.yml` - Shellcheck 検証
  - `hadolint-ci.yml` - Dockerfile Lint 検証
  - `add-reviewer.yml` - 自動レビュアー割り当て
- **環境設定ファイル**:
  - `recorder.env` - 録画対象設定（TARGET, CHANNEL/PLAYLIST, TITLE_FILTER）
  - `discord-deliver.env` - Discord 通知設定
  - これらのファイルは `.gitignore` に含まれる
- **watch-new-movie の動作**:
  - `/data/` ディレクトリを監視
  - 中間フォーマットファイル（.f140, .f248, .f299）を除外
  - `/data/notified.json` で通知済み状態を管理
  - 初回実行時は通知をスキップ
  - ダウンロード成功時は緑色（0x00ff00）、エラー時は赤色（0xff0000）の Discord Embed
