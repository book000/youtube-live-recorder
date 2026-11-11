# GitHub Copilot Review Instructions

Review guidance for pull requests in this repository. Read `AGENTS.md` first; it holds the project overview, commands, behavior invariants and conventions.

## Language

- Write review comments in English. Code comments, docstrings, documentation, commit messages and PR text are English as well; runtime messages (logs, errors) are English without emoji.

## Review checklist

- **Type safety**: flag added `any`, `skipLibCheck` or suppressed type errors, and new functions or interfaces without English JSDoc.
- **Notification invariants**: a failed per-movie POST must not mark the movie as notified and must make the run fail (red Embed, exit code 1) so it is retried. Do not approve removing or weakening the per-key (`dirname/filename`) tracking or the first-run silent bootstrap; both are intentional. Check that the Embed colors and field structure are intact.
- **Error handling**: exceptions in new logic (file scanning, JSON read/write) must not be silently swallowed.
- **Configuration and secrets**: new settings go through environment variables; no tokens, webhook URLs or credentials in code or config files.
- **Shell and Docker**: in `entrypoint.sh`, check for unquoted expansions and broken `TARGET` validation; ShellCheck and hadolint must stay clean.
- Do not suggest adding tools, frameworks, dependencies or CI steps that the repository does not already use.

## Known non-issues (do not flag)

- No application test framework; do not demand unit tests.
- `.catch(() => null)` on the red-Embed POST in the top-level handler of `watch-new-movie/src/main.ts` is best effort by design. It does not apply to the per-movie POST.
- Hardcoded `http://discord-deliver` (Compose service name) and the fixed `/data/` mount point.
- Exclusion of `.f140`, `.f248`, `.f299` files with simple `.includes` checks.
- Versions in `package.json` and the `Dockerfile` (`YT_DLP_VERSION`, `DENO_VERSION`) are managed by Renovate.
- `# shellcheck disable=...` comments in `entrypoint.sh`.
