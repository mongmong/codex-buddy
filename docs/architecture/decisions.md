# Architecture Decisions

This file records cross-cutting architectural decisions for the Codex Buddy workspace.
Decisions are append-only.
Plans introducing new decisions update this file during the Ship step.

## D-001 — Codex Plugin Layout

Plugins live under `plugins/plugin-name/` and use `plugins/plugin-name/.codex-plugin/plugin.json`.
Repo-local marketplace metadata lives at `.agents/plugins/marketplace.json`.

Why: this follows Codex plugin scaffold conventions and keeps the repo installable as a Codex plugin marketplace.

## D-002 — One Node Companion Runtime Per Plugin

Each CLI-wrapper plugin uses one Node ESM companion script at `scripts/buddy.mjs`, with focused helper modules under `scripts/lib/`.
No external runtime dependency is added until a plan justifies it.

Why: this preserves the source plugin's auditable runtime shape while keeping dependency management out of the bootstrap.

## D-003 — Hybrid Review Output

Reviews use Markdown findings followed by a minimal fenced JSON trailer with `verdict` and `blockers`.

Why: this keeps rich findings readable while preserving a small machine-readable gate signal across heterogeneous opencode-backed models.

## D-004 — Project-Local Runtime State

Plugin runtime state lives under `.codex-buddy/plugin-name/` at the project root.
Plugin-controlled transient prompt and task files live under `.codex-buddy/plugin-name/tmp/`, not `/tmp` or `${TMPDIR}` by default.

Why: this avoids unbounded system temp growth and keeps plugin state scoped to the project.

## D-005 — Bootstrapping Reviews Use Raw opencode

Until the Codex `opencode` plugin exists, plan, code, and investigation gates use raw `opencode run` commands from the repo root.
The raw commands are a bootstrap substitute for the future plugin review surface.

Why: the workflow must be live before the plugin that will eventually automate it exists.

## D-006 — Parity With Claude Code `opencode`

The first product target is a Codex-native `opencode` plugin with practical feature parity with `../claudecode-buddy/plugins/opencode`.
Codex host limitations must be documented rather than silently omitting features.

Why: the user explicitly chose parity as the goal, with `/claudecode:*` support deferred to a future plan.

## D-007 — Handwritten Runtime Validators First

Runtime validation uses small handwritten validators until a plan justifies adding schema dependencies.

Why: this preserves the source plugin's low-dependency runtime posture and keeps early plugin behavior easy to audit.

## D-008 — Multi-Reviewer Gates

Substantial plans and code changes use Codex self-review plus multiple external opencode reviewers.
Plan review uses deeper planning models.
Code review uses the same reviewer diversity with a faster DeepSeek tier.
Complex bug investigations use a separate read-only investigation gate with Codex self-investigation and multiple external opencode investigators.
Investigation uses a smaller external roster than plan and code review because diagnosis benefits from triangulation rather than ship/no-ship consensus.

Why: the workspace intentionally mirrors the stronger review discipline from `../magicburg-go/CLAUDE.md` while adapting it to Codex and the current Phase 0 raw-opencode bootstrap.

## D-009 — Conservative Lifecycle Hooks

The `opencode` plugin ships hook helper scripts and a gate command, but `plugins/opencode/hooks.json` keeps active lifecycle hooks disabled until Codex lifecycle event names are verified.
The directly testable helpers use `CODEX_PROJECT_DIR` and `.codex-buddy/opencode/` state.

Why: local Codex plugin examples verify plugin-root `hooks.json` and a `PostToolUse` event, but do not verify lifecycle events equivalent to the source plugin's session and stop hooks.
The plugin preserves the runtime capability without installing unverified host hooks.
See `docs/specs/001-opencode-plugin.md` and `docs/plans/001-opencode-plugin-parity.md`.

## How To Add A Decision

1. Add a new `## D-NNN — Short Title` section.
2. State the decision directly.
3. Explain why.
4. Link the plan or spec that introduced it.
