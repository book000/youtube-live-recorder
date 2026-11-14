# AGENTS.md

Guidance for AI coding agents and contributors. `CLAUDE.md` imports this file, and `.github/copilot-instructions.md` adds the review checklist.

## Language

- All deliverables are written in **English**: commit messages, PR/Issue titles and bodies, review comments, code comments and docstrings, and documentation (`README.md`, `AGENTS.md`, etc.).
- PR titles and bodies must be English; `.github/workflows/check-pr-language.yml` (`scripts/check-pr-language.mjs`) fails a PR whose title or body is mostly Japanese.
- Exceptions (keep as is): quotations, technical identifiers, generated files, and external source text.
- Runtime messages (logs, errors, `entrypoint.sh` output) are English, without emoji.
- Do not rewrite Git history to change the language of past commits.

## Overview

A Docker-based tool that records YouTube live streams and notifies Discord when a recording finishes. `docker-compose.yml` runs three services.

- `recorder` (root `Dockerfile`, `entrypoint.sh`): Bash on `python:3-slim` with `yt-dlp`, `ffmpeg` and Deno (the JavaScript runtime used by `yt-dlp`).
- `watch-new-movie` (`watch-new-movie/`, Node.js/TypeScript): scans `/data/` for finished MP4 files and notifies Discord.
- `discord-deliver`: the external image `book000/discord-deliver`; its source is not in this repository.

## Commands

Run Node.js commands from `watch-new-movie/` (Yarn 1).

```bash
yarn install        # install dependencies
yarn dev            # run src/main.ts with auto-reload (ts-node-dev)
yarn build          # run src/main.ts once via ts-node (what the container runs hourly)
yarn compile        # tsc -p . (outputs to dist/)
yarn compile:test   # tsc --noEmit
yarn start          # node ./dist/main.js
yarn lint           # prettier --check, eslint and tsc in parallel
yarn fix            # prettier --write and eslint --fix
```

Run Docker commands from the repository root (the Compose file uses published images and does not build locally): `docker compose up -d`, `docker compose logs -f`, `docker compose down`.

Before opening a PR, `yarn lint` and `yarn compile:test` must pass in `watch-new-movie/`. There is no test framework for the application. `node --test scripts/check-pr-language.test.mjs` runs the self-check of the PR language script.

## Structure

- `entrypoint.sh`: the recorder loop. It requires `TARGET` and one of `CHANNEL` or `PLAYLIST` (`PLAYLIST` wins if both are set) and exits with an error otherwise. If the download archive `/data/recorded/<TARGET>` does not exist, it first adds the video IDs listed for the target URL to it without downloading (for `CHANNEL` the URL is the `/live` page, so this is normally only the current live stream, and nothing when the channel is not live). It then loops every 5 seconds: `yt-dlp` writes into `/data/<TARGET>/part/`, and finished `*.mp4` files (excluding `*.f*.mp4` intermediates) are moved to `/data/<TARGET>/`. It runs `yt-dlp -U` every 10 minutes. Optional `TITLE_FILTER` (passed to `--match-title`; expanded unquoted, so it cannot contain whitespace) and `OUTPUT_FILENAME_PATTERN` (yt-dlp output template, default `%(title)s.%(ext)s`).
- `watch-new-movie/src/main.ts`: the only application source file, run once per hour by `watch-new-movie/entrypoint.sh`.
- `scripts/check-pr-language.mjs`: dependency-free CI helper for the PR language check.
- `.github/workflows/`: `nodejs-ci.yml` (reusable workflow from `book000/templates` for `watch-new-movie`), `docker.yml` (builds/publishes `book000/youtube-live-recorder` and `book000/youtube-live-recorder-watch-new-movie`), `shell-ci.yml` (ShellCheck), `hadolint-ci.yml`, `check-pr-language.yml`, `add-reviewer.yml`.
- Settings files `recorder.env` and `discord-deliver.env` are `.gitignore`d (`*.env`); never commit real values.

## watch-new-movie behavior

- Scans each directory directly under `/data/` for `.mp4` files, skipping names containing `.f140`, `.f248` or `.f299` (yt-dlp intermediate formats).
- Tracks notified keys (`dirname/filename`) in `/data/notified.json`. Do not remove this idempotency check; it prevents duplicate notifications on every scan.
- A key is stored only after its POST succeeded; a movie whose POST failed is retried on the next run. The file is rewritten atomically (temporary file plus rename).
- While `notified.json` is missing (the first run) nothing is notified: the scan records the files it finds as already notified and writes the file, even when it finds none (the bootstrap). An existing empty list is not a first run. This is intentional bootstrap behavior, not a bug.
- Notifications are POSTed to `http://discord-deliver` (the Compose service name): a green (`0x00ff00`) Embed per new movie, and a red (`0xff0000`) Embed from the top-level handler for any error from `main()`. When any movie's POST fails, the remaining movies are still processed, then `main()` throws, the red Embed is sent (best effort), and the process exits with code 1.
- When changing the Embed fields or the `notified.json` schema, update this section and the relevant parts of `README.md` in the same change.

## Conventions

- TypeScript strict mode. Do not enable `skipLibCheck` or suppress type errors to get past them.
- Functions and interfaces have English JSDoc. Keep configuration in environment variables, not hardcoded values.
- Formatting and linting follow `watch-new-movie/.prettierrc.yml` and `watch-new-movie/eslint.config.mjs` (`@book000/eslint-config`).
- Shell scripts must pass ShellCheck and the Dockerfiles must pass hadolint. The `# shellcheck disable` comments in `entrypoint.sh` are deliberate.
- Version pins: Node.js in `watch-new-movie/.node-version`; `yt-dlp` (`YT_DLP_VERSION`) and Deno (`DENO_VERSION`) in the root `Dockerfile`. Renovate manages them.
- Update the relevant documentation (`README.md`, this file) when behavior, configuration or services change.

## Git

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) with an English description; branches follow [Conventional Branch](https://conventional-branch.github.io) short form (`feat/...`, `fix/...`).
- Do not commit to Renovate PRs. Never commit secrets, tokens or internal URLs, and never log credential values.
