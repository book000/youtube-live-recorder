# GitHub Copilot レビュー指示

GitHub Copilot がこのリポジトリの Pull Request をレビューする際の指針です。以下の観点を優先し、既知の非問題を誤検知として指摘しないでください。

## プロジェクト前提

- 2 サービス構成: `recorder`（Python/Bash・ルートの `entrypoint.sh`、`yt-dlp`/`ffmpeg` 使用）と `watch-new-movie`（Node.js/TypeScript）。
- `watch-new-movie` は `/data/` 配下の MP4 を検知し `http://discord-deliver`（Docker Compose のサービス名）へ通知する。
- Node.js アプリのソースは `watch-new-movie/src/main.ts` のみ。

## レビューで重視する点

- **言語規約**: レビューコメントは日本語。コード内コメント・JSDoc は日本語、エラーメッセージは英語。日本語と英数字の間に半角スペースがあるか。
- **型安全性**: TypeScript は strict 前提。`any` の追加、`skipLibCheck` の有効化、型エラーの握り潰しは指摘する。新規の関数・インターフェースに日本語 JSDoc があるか確認する。
- **エラーハンドリング**: 通知失敗は握り潰す設計だが（下記参照）、ファイル走査・JSON 読み書きなど新規追加ロジックの例外が握り潰されていないか確認する。
- **設定のハードコード**: 新たに追加される設定値は環境変数経由か。トークン・Webhook URL・認証情報がコードや設定ファイルに直書きされていないか。
- **シェルスクリプト**: `entrypoint.sh` の変更では、変数の未クオート展開や `TARGET` 等の入力検証が崩れていないか。ShellCheck 準拠か。
- **Dockerfile**: hadolint 準拠か。ベースイメージやパッケージ導入の変更が妥当か。
- **通知フォーマット**: Discord Embed の色（成功 `0x00ff00` / エラー `0xff0000`）やフィールド構造を壊していないか。

## 指摘しない既知の非問題

- **テストの欠如**: テストフレームワークは未導入。ユニットテストの追加を一律に要求しない。
- **通知呼び出しの `.catch(() => null)`**: `axios.post('http://discord-deliver', …).catch(() => null)` は通知失敗でアプリを止めない意図的な設計。
- **`http://discord-deliver` のハードコード**: Docker Compose のサービス名であり、秘密情報でも設定漏れでもない。
- **`/data/` の絶対パス**: コンテナ内の固定マウント先で意図的。
- **中間フォーマットの除外**: `.f140` `.f248` `.f299` の除外や単純な `.includes` 判定は既知の仕様。
- **依存バージョン**: `package.json` や `Dockerfile`（`YT_DLP_VERSION` 含む）のバージョンは Renovate が管理。「古い依存」としての指摘は不要。
- **`entrypoint.sh` の `# shellcheck disable=...` コメント**: 検討済みの意図的な抑制。

## 規約リファレンス

- コミット: [Conventional Commits](https://www.conventionalcommits.org/)（`<description>` は日本語）。ブランチ: [Conventional Branch](https://conventional-branch.github.io) 短縮形。
- Lint/Format: ESLint（`watch-new-movie/eslint.config.mjs`）と Prettier（`watch-new-movie/.prettierrc.yml`）に準拠。CI は `yarn lint` と `yarn compile:test` 相当を実行する。
