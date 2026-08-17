# CLAUDE.md

Defines the guidelines for Claude Code when working in this repository.

## Project Overview

A Docker-based application that automatically records and downloads YouTube live videos. It consists of the following two services.

- **recorder** (Python/Bash, repository root): Records live streams with `yt-dlp` and `ffmpeg`. The logic lives in `entrypoint.sh`.
- **watch-new-movie** (Node.js/TypeScript, `watch-new-movie/`): Detects finished MP4 recordings and notifies Discord.

`discord-deliver`, used for notification delivery, is an external Docker image; its source is not included in this repository.

## Development Commands

Run Node.js app commands from the `watch-new-movie/` directory.

```bash
cd watch-new-movie
yarn install         # install dependencies
yarn dev             # dev mode (auto-reload via ts-node-dev)
yarn build           # run src/main.ts directly via ts-node
yarn start           # run the compiled dist/main.js
yarn compile         # compile with tsc -p . (outputs to dist/)
yarn compile:test    # tsc --noEmit (type check only)
yarn lint            # run prettier + eslint + tsc in parallel
yarn fix             # prettier --write and eslint --fix
```

Run Docker commands from the repository root.

```bash
docker compose up --build   # build and start
docker compose up -d        # start in background
docker compose logs -f      # view logs
docker compose down         # stop
```

## Architecture and Key Files

```
.
├── .github/workflows/          # CI/CD workflows
├── scripts/                    # CI helper scripts (dependency-free)
├── watch-new-movie/
│   └── src/main.ts             # Discord notification logic (the only app source file)
├── Dockerfile                  # for recorder (python:3-slim + yt-dlp/ffmpeg)
├── entrypoint.sh               # main logic for recorder
├── docker-compose.yml          # orchestration of 3 services
└── renovate.json               # Renovate configuration
```

Behavior of `watch-new-movie/src/main.ts`:

- Scans each directory under `/data/` for MP4 files.
- Excludes intermediate format files (`.f140`, `.f248`, `.f299`).
- Tracks notified keys (`dirname/filename`) in `/data/notified.json`. Do not remove this idempotency check — it is what prevents duplicate Discord notifications on every scan.
- On the first run (`notified.json` is empty), does not notify and initializes existing files as already notified. This is intentional bootstrap behavior, not a bug to fix.
- Notifies by POSTing to `http://discord-deliver`. Uses a green (`0x00ff00`) Embed on success, and a red (`0xff0000`) Embed on any error from `main()`.

## Coding Conventions

- Project language: English is the primary language for all project artifacts (code, comments, commit messages, PR titles/bodies, and documentation). The only exception is direct conversation with Claude Code itself, which follows the user's personal/global instructions.
- Code comments / JSDoc: English. Error messages: English.
- Shell/script output (recorder logs, `entrypoint.sh` messages) is English, without emoji.
- Functions and interfaces must have English JSDoc.
- TypeScript assumes strict mode. Never enable `skipLibCheck` to bypass type errors.
- Manage configuration via environment variables, not hardcoded values.
- Follow Prettier (`.prettierrc.yml`) for formatting and ESLint (`eslint.config.mjs`, using `@book000/eslint-config`) for linting.

## Testing

No test framework is set up. Quality is ensured by the following.

- `yarn lint` and `yarn compile:test` pass without errors.
- GitHub Actions CI succeeds.
- Manual verification via Docker Compose.

## Git / Commits

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`<type>(<scope>): <description>`, `<description>` in English). Example: `feat: add Discord notification feature`.
- Branches use [Conventional Branch](https://conventional-branch.github.io) short form (`feat`, `fix`, …).
- Do not add commits or updates to PRs created by Renovate.
- Before committing, confirm no sensitive information (tokens, passwords, internal URLs) is included.
- PR titles and bodies must be in English (enforced by `check-pr-language.yml`).

## Security

- Never commit real values for `recorder.env` or `discord-deliver.env` (both `.gitignore`d).
- Never log credential or token values, even in debug output.

## Repository Specifics

- **Docker Hub**: Publishes two images, `book000/youtube-live-recorder` (recorder) and `book000/youtube-live-recorder-watch-new-movie` (Node.js).
- **Node.js version**: Pinned in `watch-new-movie/.node-version`.
- **yt-dlp version**: Managed by Renovate via `ENV YT_DLP_VERSION` in the root `Dockerfile`.
- **Deno version**: Managed by Renovate via `ENV DENO_VERSION` in the root `Dockerfile`. Used by yt-dlp as a JavaScript runtime.
- **GitHub Actions**:
  - `nodejs-ci.yml`: Builds `watch-new-movie` via `book000/templates`'s reusable workflow.
  - `docker.yml`: Builds/publishes both Docker images.
  - `shell-ci.yml`: ShellCheck.
  - `hadolint-ci.yml`: Dockerfile lint.
  - `add-reviewer.yml`: Automatic reviewer assignment.
  - `check-pr-language.yml`: Fails the PR if its title or body is mostly Japanese.
- **Environment configuration files** (all `.gitignore`d):
  - `recorder.env`: Recording target settings (`TARGET`, `CHANNEL`/`PLAYLIST`, `TITLE_FILTER`). `TARGET` is required and becomes the save-destination directory name.
  - `discord-deliver.env`: Discord notification settings.

## Documentation Updates

When changing a feature, dependency, or configuration, immediately update the related documentation.

- `README.md`: When features or usage change.
- `watch-new-movie/package.json`: When dependencies or scripts change.
- `docker-compose.yml`: When service composition changes.
- `watch-new-movie/.node-version`: When the Node.js version changes.
- This file / `.github/copilot-instructions.md`: When work policy or rules change.
- When changing the Discord notification embed format/fields or the `notified.json` schema in `watch-new-movie/src/main.ts`, update both `README.md`'s usage section and this file's `watch-new-movie/src/main.ts` behavior bullets in the same change.
