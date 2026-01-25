# AI エージェント共通作業方針

## 目的

このドキュメントは、一般的な AI エージェントがこのプロジェクトで作業を行う際の共通作業方針を定義します。

## 基本方針

- **会話言語**: 日本語
- **コード内コメント**: 日本語（JSDoc など）
- **エラーメッセージ**: 英語
- **日本語と英数字の間**: 半角スペースを挿入
- **コミット規約**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は日本語で記載
  - 例: `feat: Discord 通知機能を追加`

## 判断記録のルール

すべての技術判断について、以下の項目を記録してください：

1. **判断内容**: 何を決定したか
2. **代替案**: 検討した他の選択肢
3. **採用理由**: なぜその案を選んだか
4. **前提条件**: 判断の基礎となる前提や仮定
5. **不確実性**: 不確実な要素や想定

**重要**: 仮定を事実のように扱わず、前提条件や不確実性を明示してください。

## プロジェクト概要

- **目的**: YouTube ライブ動画を自動録画・ダウンロードする Docker ベースのアプリケーション
- **主な機能**:
  - YouTube ライブストリームの自動録画（チャンネル・プレイリスト指定）
  - タイトルフィルタリング（正規表現）
  - 動画品質選択（ベスト動画+ベスト音声）
  - MP4 形式への自動変換
  - Discord Webhook 通知
- **技術スタック**:
  - 言語: TypeScript 5.9.3
  - ランタイム: Node.js 24.13.0
  - パッケージマネージャー: Yarn 1.22.22
  - コンテナ: Docker + Docker Compose
  - 外部ツール: yt-dlp, ffmpeg

## 開発手順（概要）

1. **プロジェクト理解**:
   - README.md を読む
   - 主要なソースコード（`watch-new-movie/src/main.ts`）を確認
   - アーキテクチャを理解する（3 サービス構成）

2. **依存関係インストール**:
   ```bash
   cd watch-new-movie
   yarn install
   ```

3. **変更実装**:
   - TypeScript で実装
   - JSDoc コメントを日本語で記載
   - エラーメッセージは英語で記載
   - 日本語と英数字の間に半角スペースを挿入

4. **テストと Lint/Format 実行**:
   ```bash
   # Lint チェック
   yarn lint

   # 自動修正
   yarn fix

   # TypeScript コンパイルチェック
   yarn compile:test
   ```

5. **動作確認**:
   ```bash
   # Docker Compose で起動
   docker compose up --build
   ```

6. **コミット**:
   - Conventional Commits 形式でコミット
   - センシティブな情報が含まれていないことを確認

## セキュリティ / 機密情報

- **認証情報**: API キーや認証情報を Git にコミットしない
- **環境変数**: `recorder.env` と `discord-deliver.env` は `.gitignore` に含める
- **ログ**: 個人情報や認証情報をログに出力しない
- **Discord Webhook URL**: 環境変数で管理する

## コーディング規約

- **TypeScript**: `skipLibCheck` での回避は禁止
- **型安全性**: 厳格な型チェックを活用
- **ドキュメント**: 関数とインターフェースに JSDoc を日本語で記載
- **フォーマット**: Prettier（`.prettierrc.yml`）に従う
- **Lint**: ESLint（`eslint.config.mjs`）に従う

## リポジトリ固有

- **モノレポ構造**: `recorder`（Python/Bash）、`watch-new-movie`（Node.js）、`discord-deliver`（Docker コンテナサービス）の 3 サービス
- **Docker Hub デプロイ**: 2 つのイメージ（`book000/youtube-live-recorder` と `book000/youtube-live-recorder-watch-new-movie`）
- **Renovate**: 自動依存関係更新が有効。Renovate が作成した PR に対して追加コミットや更新を行わない
- **Node.js バージョン固定**: `watch-new-movie/.node-version` で 24.13.0 に固定
- **yt-dlp バージョン管理**: `Dockerfile` の ENV コメントで Renovate が管理
- **GitHub Actions**:
  - `nodejs-ci.yml` - Node.js CI
  - `docker.yml` - Docker イメージビルド
  - `shell-ci.yml` - Shellcheck 検証
  - `hadolint-ci.yml` - Dockerfile Lint 検証
  - `add-reviewer.yml` - 自動レビュアー割り当て
- **watch-new-movie の動作**:
  - `/data/` ディレクトリの MP4 ファイルを監視
  - 中間フォーマットファイル（.f140, .f248, .f299）を除外
  - `/data/notified.json` で通知済み状態を管理
  - 初回実行時は通知をスキップ
  - ダウンロード成功時は緑色（0x00ff00）、エラー時は赤色（0xff0000）の Discord Embed

## ドキュメント更新

コード変更時には以下のドキュメントを適宜更新してください：

- `README.md` - 主な機能や使用方法の変更時
- `watch-new-movie/package.json` - 依存関係やスクリプトの変更時
- `docker-compose.yml` - サービス構成の変更時
- `watch-new-movie/.node-version` - Node.js バージョンの変更時

## 参考リンク

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [プロジェクト README](./README.md)
- [watch-new-movie メインコード](./watch-new-movie/src/main.ts)
