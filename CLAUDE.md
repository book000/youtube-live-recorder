# CLAUDE.md

Claude Code がこのリポジトリで作業する際の方針を定義します。

## プロジェクト概要

YouTube ライブ動画を自動録画・ダウンロードする Docker ベースのアプリケーション。次の 2 サービスで構成されます。

- **recorder**（Python/Bash・リポジトリルート）: `yt-dlp` と `ffmpeg` でライブ配信を録画する。ロジックは `entrypoint.sh`。
- **watch-new-movie**（Node.js/TypeScript・`watch-new-movie/`）: 録画完了した MP4 を検知して Discord へ通知する。

通知配信に使う `discord-deliver` は外部 Docker イメージであり、本リポジトリにソースは含まれません。

## 開発コマンド

Node.js アプリのコマンドは `watch-new-movie/` ディレクトリで実行します。

```bash
cd watch-new-movie
yarn install         # 依存インストール
yarn dev             # 開発モード（ts-node-dev で自動リロード）
yarn build           # ts-node で src/main.ts を直接実行
yarn start           # コンパイル済み dist/main.js を実行
yarn compile         # tsc -p . でコンパイル（dist/ 出力）
yarn compile:test    # tsc --noEmit（型チェックのみ）
yarn lint            # prettier + eslint + tsc を並列実行
yarn fix             # prettier --write と eslint --fix
```

Docker はリポジトリルートで操作します。

```bash
docker compose up --build   # ビルドして起動
docker compose up -d        # バックグラウンド起動
docker compose logs -f      # ログ確認
docker compose down         # 停止
```

## アーキテクチャと主要ファイル

```
.
├── .github/workflows/          # CI/CD ワークフロー
├── watch-new-movie/
│   └── src/main.ts             # Discord 通知ロジック（唯一のアプリソース）
├── Dockerfile                  # recorder 用（python:3-slim + yt-dlp/ffmpeg）
├── entrypoint.sh               # recorder のメインロジック
├── docker-compose.yml          # 3 サービスのオーケストレーション
└── renovate.json               # Renovate 設定
```

`watch-new-movie/src/main.ts` の動作:

- `/data/` 配下の各ディレクトリから MP4 ファイルを走査する。
- 中間フォーマットファイル（`.f140` `.f248` `.f299`）は除外する。
- `/data/notified.json` で通知済みキー（`dirname/filename`）を管理する。
- 初回実行時（`notified.json` が空）は通知せず、既存ファイルを通知済みとして初期化する。
- 通知は `http://discord-deliver` へ POST する。成功時は緑（`0x00ff00`）、`main()` 全体のエラー時は赤（`0xff0000`）の Embed。

## コーディング規約

- **会話言語**: 日本語。**コード内コメント / JSDoc**: 日本語。**エラーメッセージ**: 英語。
- 日本語と英数字の間には半角スペースを入れる。
- 関数・インターフェースには日本語 JSDoc を付ける。
- TypeScript は strict 前提。`skipLibCheck` を有効にして型エラーを回避してはならない。
- 設定はハードコードせず環境変数で管理する。
- フォーマットは Prettier（`.prettierrc.yml`）、Lint は ESLint（`eslint.config.mjs`、`@book000/eslint-config` を利用）に従う。

## テスト

テストフレームワークは未導入。品質は次で担保する。

- `yarn lint` と `yarn compile:test` がエラーなく通ること。
- GitHub Actions CI が成功すること。
- Docker Compose での手動動作確認。

## Git / コミット

- コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/)（`<type>(<scope>): <description>`、`<description>` は日本語）。例: `feat: Discord 通知機能を追加`。
- ブランチは [Conventional Branch](https://conventional-branch.github.io) 短縮形（`feat`, `fix`, …）。
- Renovate が作成した PR には追加コミットや更新を行わない。
- コミット前に機密情報（トークン・パスワード・内部 URL）が含まれないことを確認する。

## リポジトリ固有

- **Docker Hub**: `book000/youtube-live-recorder`（recorder）と `book000/youtube-live-recorder-watch-new-movie`（Node.js）の 2 イメージを公開。
- **Node.js バージョン**: `watch-new-movie/.node-version` で固定（現在 24.18.0）。
- **yt-dlp バージョン**: ルート `Dockerfile` の `ENV YT_DLP_VERSION` を Renovate が管理（現在 2026.07.04）。
- **GitHub Actions**:
  - `nodejs-ci.yml`: `book000/templates` の再利用可能ワークフローで `watch-new-movie` をビルド。
  - `docker.yml`: 両 Docker イメージのビルド/公開。
  - `shell-ci.yml`: ShellCheck。
  - `hadolint-ci.yml`: Dockerfile Lint。
  - `add-reviewer.yml`: レビュアー自動割り当て。
- **環境設定ファイル**（いずれも `.gitignore` 対象）:
  - `recorder.env`: 録画対象設定（`TARGET`、`CHANNEL`/`PLAYLIST`、`TITLE_FILTER`）。`TARGET` は必須で保存先ディレクトリ名になる。
  - `discord-deliver.env`: Discord 通知設定。

## ドキュメント更新

機能・依存・設定を変更したら、関連ドキュメントを即時更新する。

- `README.md`: 機能や使い方の変更時。
- `watch-new-movie/package.json`: 依存・スクリプトの変更時。
- `docker-compose.yml`: サービス構成の変更時。
- `watch-new-movie/.node-version`: Node.js バージョンの変更時。
- このファイル / `.github/copilot-instructions.md`: 作業方針やルールの変更時。
