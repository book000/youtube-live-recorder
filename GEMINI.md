# GEMINI.md

## 目的
- Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語
- トーン: 簡潔で事実ベース
- 形式: Markdown

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- PR タイトルとコミット本文の言語: PR タイトルは Conventional Commits 形式（英語推奨）。PR 本文は日本語。コミットは Conventional Commits 形式（description は日本語）。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
Record and download YouTube live videos with support for channels and playlists. Docker/Docker Compose compatible for containerized deployment.

### 技術スタック
- **言語**: TypeScript, Shell
- **フレームワーク**: Node.js, ts-node
- **パッケージマネージャー**: yarn
- **主要な依存関係**:
  - axios@1.13.2

## コーディング規約
- フォーマット: 既存設定（ESLint / Prettier / formatter）に従う。
- 命名規則: 既存のコード規約に従う。
- コメント言語: 日本語
- エラーメッセージ: 英語

### 開発コマンド
```bash
# install
yarn install

# dev
ts-node-dev -r tsconfig-paths/register ./src/main.ts

# build
ts-node -r tsconfig-paths/register ./src/main.ts

# compile
tsc -p .

# test
tsc -p . --noEmit

# lint
run-p -c lint:prettier lint:eslint lint:tsc

# fix
run-s fix:prettier fix:eslint

```

## 注意事項
- 認証情報やトークンはコミットしない。
- ログに機密情報を出力しない。
- 既存のプロジェクトルールがある場合はそれを優先する。

## リポジトリ固有
- **config_files**: {'recorder.env': 'Runtime configuration (CHANNEL, PLAYLIST, TARGET, TITLE_FILTER)', 'docker-compose.yml': 'Docker Compose setup for containerized execution'}
**workflow_ci:**
  - nodejs-ci.yml
  - shell-ci.yml
  - hadolint-ci.yml
  - docker.yml
  - add-reviewer.yml
- **note**: Docker-first architecture for production deployment