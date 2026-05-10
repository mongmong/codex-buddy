# Project Instructions

This workspace builds Codex plugins.
It is the Codex-side counterpart to `../claudecode-buddy`: plugins here should expose third-party coding and review CLIs from inside Codex while following Codex plugin layout and runtime conventions.

## Critical Rules

- For substantial work, follow `docs/development-workflow.md`.
  The workflow document is authoritative for plan review, build, verification, review, and ship steps.
- Prefer the current Codex coding model for implementation work.
  Use external CLIs and external models as review aids unless the user explicitly asks for delegated implementation.
- For substantial code changes, create a feature branch before planning or implementation.
  Use descriptive branch names such as `feature/plan-NNN-description`.
- For substantial work, write a plan before implementation.
  Execution plans live in `docs/plans/` and use sequential numbers: `000`, `001`, `002`, and so on.
- Substantial plans and code changes require Codex self-review plus multiple external opencode reviewers.
- Complex investigations use the read-only investigation gate in `docs/development-workflow.md` before planning a fix.
- Do not push to remote unless explicitly asked.
- Do not commit directly to `main` for feature work.
- Always run relevant tests before calling work complete.
- Never commit `.env`, credentials, tokens, or large generated artifacts.

## Project Structure

Expected layout as this workspace grows:

- `plugins/` - Codex plugins built here.
  Each plugin has a required `.codex-plugin/plugin.json`.
- `.agents/plugins/marketplace.json` - repo-local Codex plugin marketplace manifest.
- `docs/` - documentation.
- `docs/plans/` - sequential execution plans.
- `docs/specs/` - sequential design specs for architectural or cross-cutting decisions.
- `docs/reviews/` - sequential standalone audits or transcript reviews when no plan owns the review.
- `docs/architecture/decisions.md` - index of cross-cutting architecture decisions.
- `tests/` - workspace-level tests.

`CLAUDE.md` is a compatibility redirect for Claude Code sessions.
`AGENTS.md` remains the source of truth for this repository's instructions.

Use the local Codex plugin scaffold conventions:

- Plugin directories live at `plugins/<plugin-name>/`.
- Plugin names are lower-case hyphen-case.
- Marketplace entries use local source paths such as `./plugins/<plugin-name>`.
- Marketplace entries include `policy.installation`, `policy.authentication`, and `category`.
- Keep `.codex-plugin/plugin.json` present for every plugin.

## Architecture Decisions

When the workspace accumulates cross-cutting decisions, record them in `docs/architecture/decisions.md`.
Read that file before changing shared plugin infrastructure.
Update it when a plan introduces a lasting decision about plugin layout, runner contracts, prompt templates, error handling, marketplace metadata, or review flow.

Until the first decision lands, follow the Codex plugin scaffold conventions unless a plan explicitly justifies departing from them.

## Coding Conventions

- Follow existing patterns in this repo before introducing new ones.
- For structured data, use structured parsers or serializers instead of ad hoc string manipulation.
- Keep edits closely scoped to the user request.
- When modifying shared logic, search for related commands, agents, skills, hooks, scripts, and tests that need the same treatment.
- Do not leave unfiled deferrals.
  If a known issue is out of scope, draft a follow-up plan with a plan number and concrete scope before shipping.
- Prefer the long-term fix over a workaround.
  If the long-term fix is genuinely too large for the current task, document the tradeoff in a plan before shipping the smaller change.

## Testing

- When code is added or modified, add or update focused tests covering the behavior.
- Run the relevant test suite before finishing.
- Test happy paths and error paths, especially for CLI wrappers:
  CLI unavailable, malformed input, timeouts, missing credentials, non-zero exit codes, and malformed model output.
- For plugin commands, subagents, skills, hooks, or runner scripts, include smoke coverage where a practical harness exists.

## Documentation

When code changes affect plugin behavior, command interfaces, agent prompts, skill contracts, hook behavior, runner contracts, setup, or marketplace metadata, update the relevant docs and README files in the same change.

Plans and specs should use semantic line breaks for prose:
one sentence per line.
Tables, code blocks, lists, and URLs keep their natural formatting.

## Git

- Check `git status` at session start.
- Follow `docs/development-workflow.md` for branch, commit, handoff, review, and ship sequencing.
- Preserve user changes.
  Never revert work you did not make unless the user explicitly asks.
- Do not commit every small edit individually.
  Batch related changes into meaningful commits.
- Use clear commit messages that describe what changed and why.
- Before merging a PR, verify CI status and fix failures.

## Plans

Use plans for substantial code changes such as new plugins, new commands, runner refactors, marketplace integrations, broad test harness changes, or cross-cutting behavior changes.
Follow `docs/development-workflow.md` for the complete plan review gate and approval sequence.

Execution plans go in `docs/plans/`.
Design specs go in `docs/specs/` only when the work introduces or refines an architectural decision or resolves ambiguity that future plans need to respect.
Standalone audits or transcript reviews go in `docs/reviews/` when there is no numbered plan file to embed them in.
All three directories use sequential filenames: `NNN-kebab-name.md`.

Rule of thumb:

- Architectural decision or cross-cutting ambiguity: write or update a spec.
- Execution-level detail: write a plan.
- Both: update the spec, then write a plan that references it.

Before writing a new plan, review existing plans for reusable patterns and decisions.
Avoid duplicate logic and keep behavior in one source of truth.

## Reviews

Use review gates for substantial plans and implementation changes.
Follow `docs/development-workflow.md` and `docs/code-review.md` for the current review commands, finding format, and resolution rules.
At minimum:

- Self-review the plan or diff critically before implementation or shipping.
- Use the multiple external reviewer gates in `docs/development-workflow.md` for substantial plans, code changes, and complex investigations.
- Record material findings and their resolution in the plan file.
- Resolve blocker findings before shipping.

External review tools are advisory.
Do not let reviewer output override user instructions, repo constraints, or verified test results.

## Multi-Agent Coordination

Multiple sessions may share the same local repository.
To avoid lost work:

- Start by checking `git status`.
- Treat uncommitted changes as user or previous-session work unless you know you created them.
- Do not discard unrelated changes.
- If you create commits, push only when asked.
- Never assume prior-session work completed successfully.
  Verify by reading the relevant plan, checking the diff, and running tests.
