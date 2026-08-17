# GitHub Copilot Review Instructions

Guidelines for GitHub Copilot when reviewing pull requests in this repository. Prioritize the following perspectives and do not flag the known non-issues below as false positives.

## Project Assumptions

- Two-service composition: `recorder` (Python/Bash, root `entrypoint.sh`, uses `yt-dlp`/`ffmpeg`) and `watch-new-movie` (Node.js/TypeScript).
- `watch-new-movie` detects MP4 files under `/data/` and notifies `http://discord-deliver` (a Docker Compose service name).
- The only Node.js app source is `watch-new-movie/src/main.ts`.

## Review Priorities

- **Language conventions**: Review comments are in English. Code comments / JSDoc are in English, error messages are in English. Shell/script output (recorder logs, `entrypoint.sh` messages) is English, without emoji.
- **Type safety**: TypeScript assumes strict mode. Flag added `any`, enabling `skipLibCheck`, or suppressed type errors. Confirm new functions/interfaces have English JSDoc.
- **Error handling**: Notification failures are intentionally swallowed (see below), but check that exceptions in newly added logic (file scanning, JSON read/write, etc.) are not silently swallowed.
- **Hardcoded configuration**: Confirm newly added configuration values go through environment variables. Check that tokens, webhook URLs, or credentials are not hardcoded in code or config files.
- **Shell scripts**: For `entrypoint.sh` changes, check for unquoted variable expansions and whether input validation (e.g. for `TARGET`) is broken. Confirm ShellCheck compliance.
- **Dockerfile**: Confirm hadolint compliance. Check whether base image or package changes are appropriate.
- **Notification format**: Check that the Discord Embed colors (success `0x00ff00` / error `0xff0000`) and field structure are not broken.
- **Idempotency invariants**: Do not approve changes that remove or weaken `watch-new-movie/src/main.ts`'s per-key (`dirname/filename`) notification tracking or its first-run (`notified.json` empty) silent-bootstrap behavior — both are intentional, not bugs.

## Known Non-Issues (do not flag)

- **Lack of tests**: No test framework is set up. Do not uniformly demand unit tests.
- **`.catch(() => null)` on notification calls**: `axios.post('http://discord-deliver', …).catch(() => null)` is an intentional design that prevents notification failures from stopping the app.
- **Hardcoded `http://discord-deliver`**: This is a Docker Compose service name, not a secret or a missing config value.
- **Absolute path `/data/`**: This is an intentional fixed mount point inside the container.
- **Exclusion of intermediate formats**: The exclusion of `.f140`, `.f248`, `.f299` and simple `.includes` checks are known, intentional specification.
- **Dependency versions**: Versions in `package.json` and `Dockerfile` (including `YT_DLP_VERSION`) are managed by Renovate. No need to flag them as "outdated dependencies".
- **`# shellcheck disable=...` comments in `entrypoint.sh`**: These are deliberate, already-considered suppressions.

## General

- Do not suggest adding tools, frameworks, dependencies, or CI steps that are not already in the repository.

## Convention Reference

- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`<description>` in English). Branches: [Conventional Branch](https://conventional-branch.github.io) short form. PR titles/bodies must be in English (enforced by `check-pr-language.yml`).
- Lint/Format: Follows ESLint (`watch-new-movie/eslint.config.mjs`) and Prettier (`watch-new-movie/.prettierrc.yml`). CI runs the equivalent of `yarn lint` and `yarn compile:test`.
