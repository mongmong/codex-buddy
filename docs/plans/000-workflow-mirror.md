# Workflow Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt the `../claudecode-buddy` development workflow in this Codex repo before any plugin implementation begins.

**Architecture:** Phase 0 is documentation-first.
It creates the workflow docs, review process, architecture decision index, and Codex-native `opencode` product spec that future plans must follow.
It preserves the source workflow shape while replacing Claude-only surfaces with explicit Codex rules and bootstrapping fallbacks.

**Tech Stack:** Markdown documentation, Git, raw `opencode run` for bootstrapping external reviews, Codex plugin conventions from local Codex skill docs.

---

## Source Inputs

- Approved design: `docs/superpowers/specs/2026-05-10-codex-buddy-parity-design.md`
- Source workflow: `../claudecode-buddy/docs/development-workflow.md`
- Source review process: `../claudecode-buddy/docs/code-review.md`
- Source decision index: `../claudecode-buddy/docs/architecture/decisions.md`
- Source product spec: `../claudecode-buddy/docs/specs/opencode-plugin.md`
- Current repo instructions: `AGENTS.md`
- Codex plugin scaffold guidance: `/home/chris/.codex/skills/.system/plugin-creator/SKILL.md`

## Prerequisites

- `../claudecode-buddy` exists and contains the source workflow, review process, decision index, and product spec listed above.
- `/home/chris/.opencode/bin/opencode` is installed and can reach `deepseek/deepseek-v4-pro`, `deepseek/deepseek-v4-flash`, and `volcengine-plan/glm-5.1`.
- Codex plugin skill docs exist at `/home/chris/.codex/skills/.system/plugin-creator/SKILL.md` and `/home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`.
- `rg`, `find`, `sort`, `cat`, `git`, and `mkdir` are available in the shell.

The raw `opencode run` commands use `--dangerously-skip-permissions` only for bootstrapping reviews in this trusted local workspace.
Review prompts explicitly say not to modify files.
After the Codex `opencode` plugin exists, later plans should replace this flag with the plugin's safer review surface if the host supports it.

## File Structure

- Create: `docs/development-workflow.md`
  Codex repo workflow mirror with six steps, bootstrapping review fallbacks, and session handoff rules.
- Create: `docs/code-review.md`
  Codex repo review process with raw `opencode run` reviewers before the Codex `opencode` plugin exists.
- Create: `docs/architecture/decisions.md`
  Fresh Codex decision log containing only decisions already adopted for this repo.
- Create: `docs/specs/opencode-plugin.md`
  Codex-native product spec derived from the Claude plugin spec.
- Create: `docs/specs/codex-plugin-surface-research.md`
  Research note recording verified Codex plugin surfaces and host limitations.
- Create: `.gitignore`
  Ignore `.codex-buddy/` runtime and transient state.
- Modify: `AGENTS.md`
  Point future work at the mirrored workflow and plan-review rules.
- Modify: `README.md`
  Replace the placeholder with the repo purpose and contribution pointer.
- Modify: `docs/plans/000-workflow-mirror.md`
  Add plan review, code review, and post-execution report sections as the workflow proceeds.

## Phase 0 Review Rules

Use the approved design's bootstrapping rules until the Codex `opencode` plugin exists.

- Self-review is performed by the current Codex coding session.
- External plan review uses:

```bash
/home/chris/.opencode/bin/opencode run \
  --model deepseek/deepseek-v4-pro \
  --format default \
  --print-logs --log-level INFO \
  --dangerously-skip-permissions \
  "Review docs/plans/000-workflow-mirror.md in /home/chris/workshop/codex-buddy. Focus on blockers, hidden assumptions, scope/order problems, and missing risks. Do not modify files. Return verdict approve or needs-attention with blockers."
```

- External code reviews after implementation use raw `opencode run` with:
  `deepseek/deepseek-v4-flash` and `volcengine-plan/glm-5.1`.
- Do not invent `codex:codex-rescue` or `/codex:review` equivalents during Phase 0.

## Task 1: Research Codex Plugin Surfaces

**Files:**
- Create: `docs/specs/codex-plugin-surface-research.md`

- [ ] **Step 0: Create the specs directory**

Run:

```bash
mkdir -p docs/specs
```

- [ ] **Step 1: Read local Codex plugin guidance**

Run:

```bash
cat /home/chris/.codex/skills/.system/plugin-creator/SKILL.md
```

Expected: output describes `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, optional plugin folders, and marketplace entry shape.

- [ ] **Step 2: Read exact plugin manifest reference**

Run:

```bash
cat /home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md
```

Expected: output defines the Codex plugin manifest shape.

- [ ] **Step 3: Inspect local plugin marketplace directories if present**

Run:

```bash
find /home/chris/.codex -maxdepth 5 \( -path '*/.codex-plugin/plugin.json' -o -path '*/.agents/plugins/marketplace.json' \) -type f | sort
```

Expected: either a list of local examples or no examples.
If examples exist, inspect enough of them to verify command, agent, skill, hook, and marketplace conventions.

- [ ] **Step 4: Write the research note**

Create `docs/specs/codex-plugin-surface-research.md` with this structure:

```markdown
# Codex Plugin Surface Research

## Purpose

This note records the Codex plugin surfaces verified before porting the Claude Code `opencode` plugin.
It exists so `docs/specs/opencode-plugin.md` can distinguish implemented parity from host limitations.

## Verified Sources

- `/home/chris/.codex/skills/.system/plugin-creator/SKILL.md`
- `/home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`
- Local installed plugin examples, if present.

## Confirmed Surfaces

### Manifest

Codex plugins use `plugins/plugin-name/.codex-plugin/plugin.json`.

### Marketplace

Repo-local marketplaces use `.agents/plugins/marketplace.json`.
Entries use local paths such as `./plugins/plugin-name` and include `policy.installation`, `policy.authentication`, and `category`.

### Optional Plugin Folders

Codex plugin scaffolding supports optional `skills/`, `hooks/`, `scripts/`, `assets/`, `.mcp.json`, and `.app.json`.

### Commands, Agents, And Hooks

This section states the locally verified command, agent, skill, and hook support.
If no command or agent convention is locally verifiable during Phase 0, state that the Phase 1 plugin plan must verify it before implementing command parity.

## Host Limitations

Any source plugin feature that depends on an unavailable or unverified Codex host surface must be marked as "planned with documented host limitation" in `docs/specs/opencode-plugin.md`.
```

- [ ] **Step 5: Self-review the research note**

Run:

```bash
rg -n "TB[D]|TO[D]O|placeholder|unclear|unknown" docs/specs/codex-plugin-surface-research.md
```

Expected: no matches, except the word "unknown" may appear only if it is part of an explicit verified limitation.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add docs/specs/codex-plugin-surface-research.md
git commit -m "docs: record codex plugin surface research"
```

## Task 2: Mirror Development Workflow

**Files:**
- Create: `docs/development-workflow.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Draft the workflow doc from the source**

Read:

```bash
cat ../claudecode-buddy/docs/development-workflow.md
```

Create `docs/development-workflow.md`.
Preserve these source sections:

- `Step 1 — Design`
- `Step 2 — Plan`
- `Step 3 — Build`
- `Step 4 — Verify`
- `Step 5 — Review`
- `Step 6 — Ship`
- `Session Handoff Rules`

Apply these Codex substitutions:

- Replace Claude model-tier rules with current Codex session self-review.
- Replace `CLAUDE.md` with `AGENTS.md`.
- Replace `codex:codex-rescue` and `/codex:review` requirements with current-session Codex self-review during Phase 0.
- Replace opencode plugin dispatch with raw `opencode run` until the Codex `opencode` plugin exists.
- Keep plan files under `docs/plans/`.
- Keep design specs under `docs/specs/`.

- [ ] **Step 2: Add the bootstrapping plan-review command**

In `docs/development-workflow.md`, Step 2 must include this command shape:

```bash
PLAN_PATH="docs/plans/000-workflow-mirror.md"
REPO_ROOT="$(pwd)"
/home/chris/.opencode/bin/opencode run \
  --model deepseek/deepseek-v4-pro \
  --format default \
  --print-logs --log-level INFO \
  --dangerously-skip-permissions \
  "Review ${PLAN_PATH} in ${REPO_ROOT}. Focus on blockers, hidden assumptions, scope/order problems, and missing risks. Do not modify files. Return verdict approve or needs-attention with blockers."
```

- [ ] **Step 3: Add post-implementation code-review commands**

In `docs/development-workflow.md`, Step 5 must name both raw reviewers:

```bash
/home/chris/.opencode/bin/opencode run --model deepseek/deepseek-v4-flash --format default --print-logs --log-level INFO --dangerously-skip-permissions "Code review the changes on this branch in \"$(pwd)\". Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
/home/chris/.opencode/bin/opencode run --model volcengine-plan/glm-5.1 --format default --print-logs --log-level INFO --dangerously-skip-permissions "Code review the changes on this branch in \"$(pwd)\". Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
```

- [ ] **Step 4: Update `AGENTS.md` to delegate workflow detail**

Modify `AGENTS.md` so the `Critical Rules`, `Plans`, `Reviews`, and `Git` sections point to `docs/development-workflow.md`.
Keep the existing concise repo-specific rules, but add:

```markdown
For substantial work, follow `docs/development-workflow.md`.
The workflow document is authoritative for plan review, build, verification, review, and ship steps.
```

- [ ] **Step 5: Self-review workflow doc**

Run:

```bash
rg -n "Claude|CLAUDE|Sonnet|Opus|codex:codex-rescue|/codex:review|\\.claude" docs/development-workflow.md AGENTS.md
```

Expected: no matches except references that explicitly describe source terms being translated or unavailable during Phase 0.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add docs/development-workflow.md AGENTS.md
git commit -m "docs: mirror development workflow for codex"
```

## Task 3: Mirror Code Review Process

**Files:**
- Create: `docs/code-review.md`

- [ ] **Step 1: Draft the Codex review process**

Read:

```bash
cat ../claudecode-buddy/docs/code-review.md
```

Create `docs/code-review.md` with these sections:

```markdown
# Code Review Process

Code review happens after implementation is complete.
It is distinct from the plan review gate.

Until the Codex `opencode` plugin exists, this workspace uses:

1. Codex current-session self-review.
2. Raw opencode review on `deepseek/deepseek-v4-flash`.
3. Raw opencode review on `volcengine-plan/glm-5.1`.

After the Codex `opencode` plugin ships, replace the raw opencode commands with the plugin's Codex-native review surface.

## Reviewer Commands

Use the two raw opencode commands shown below until the Codex `opencode` plugin exists.

## For Reviewers

Append a review round to the relevant plan file's `## Code Review` section.
Each finding uses `[OPEN]`, priority, file:line references, and a verdict.

## For Authors

Respond inline with `[FIXED]` or `[WONTFIX]`, including the technical response and commit reference when available.
```

- [ ] **Step 2: Include exact reviewer command templates**

Add:

```bash
/home/chris/.opencode/bin/opencode run \
  --model deepseek/deepseek-v4-flash \
  --format default \
  --print-logs --log-level INFO \
  --dangerously-skip-permissions \
  "Code review the changes on this branch in \"$(pwd)\". Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
```

```bash
/home/chris/.opencode/bin/opencode run \
  --model volcengine-plan/glm-5.1 \
  --format default \
  --print-logs --log-level INFO \
  --dangerously-skip-permissions \
  "Code review the changes on this branch in \"$(pwd)\". Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
```

- [ ] **Step 3: Self-review review doc**

Run:

```bash
rg -n "Claude Code|CLAUDE.md|codex:codex-rescue|/codex:review|opencode:opencode-review" docs/code-review.md
```

Expected: no matches except source-term explanation in a bootstrapping note.

- [ ] **Step 4: Commit Task 3**

Run:

```bash
git add docs/code-review.md
git commit -m "docs: add codex code review process"
```

## Task 4: Create Fresh Architecture Decision Index

**Files:**
- Create: `docs/architecture/decisions.md`

- [ ] **Step 1: Create the architecture directory**

Run:

```bash
mkdir -p docs/architecture
```

- [ ] **Step 2: Write the decision index**

Create `docs/architecture/decisions.md` with exactly these initial decisions:

```markdown
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

Until the Codex `opencode` plugin exists, plan and code review gates use raw `opencode run` commands from the repo root.

Why: the workflow must be live before the plugin that will eventually automate it exists.

## D-006 — Parity With Claude Code `opencode`

The first product target is a Codex-native `opencode` plugin with practical feature parity with `../claudecode-buddy/plugins/opencode`.
Codex host limitations must be documented rather than silently omitting features.

Why: the user explicitly chose parity as the goal, with `/claudecode:*` support deferred to a future plan.

## D-007 — Handwritten Runtime Validators First

Runtime validation uses small handwritten validators until a plan justifies adding schema dependencies.

Why: this preserves the source plugin's low-dependency runtime posture and keeps early plugin behavior easy to audit.

## How To Add A Decision

1. Add a new `## D-NNN — Short Title` section.
2. State the decision directly.
3. Explain why.
4. Link the plan or spec that introduced it.
```

- [ ] **Step 3: Self-review decision index**

Run:

```bash
rg -n "\\.claude|CLAUDE|Sonnet|Opus|~/.claude" docs/architecture/decisions.md
```

Expected: no matches except the phrase `Claude Code` in D-006.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
git add docs/architecture/decisions.md
git commit -m "docs: add codex architecture decisions"
```

## Task 5: Write Codex-Native `opencode` Spec Baseline

**Files:**
- Create: `docs/specs/opencode-plugin.md`

- [ ] **Step 1: Create the specs directory**

Run:

```bash
mkdir -p docs/specs
```

- [ ] **Step 2: Read source spec and research note**

Run:

```bash
cat ../claudecode-buddy/docs/specs/opencode-plugin.md
cat docs/specs/codex-plugin-surface-research.md
```

Expected: source architecture and local Codex plugin-surface findings are visible.

- [ ] **Step 3: Write Codex-native spec**

Create `docs/specs/opencode-plugin.md` with these required sections:

```markdown
# Spec — opencode Codex Plugin

## Why This Plugin Exists

This plugin gives Codex an ergonomic wrapper around the opencode CLI.
It is the Codex-side counterpart to `../claudecode-buddy/plugins/opencode`.

## Goals

- Preserve practical feature parity with the Claude Code `opencode` plugin.
- Use Codex-native plugin layout and marketplace metadata.
- Keep opencode model selection delegated to the user's opencode config.
- Avoid routine `/tmp` writes by using project-local `.codex-buddy/opencode/tmp/` transient storage.
- Provide review output that is useful to humans and machine-readable review gates.

## Non-Goals

- Do not implement `/claudecode:*` commands in this plugin.
- Do not wrap opencode TUI mode.
- Do not add external runtime dependencies without a plan.

## Architecture

The plugin root is `plugins/opencode/`.
The manifest is `plugins/opencode/.codex-plugin/plugin.json`.
The spec describes commands, agents or equivalent programmatic surfaces, skills if supported, hooks if supported, prompts, schemas, scripts, and tests based on `docs/specs/codex-plugin-surface-research.md`.

## Runtime State

Durable state lives under `.codex-buddy/opencode/` at the project root.
Transient plugin-controlled files live under `.codex-buddy/opencode/tmp/`.

## Temporary File Policy

The Claude source plugin uses `${TMPDIR:-/tmp}/opencode-prompts`.
The Codex port must not copy that pattern.
The implementation must clean per-invocation transient directories and prune stale transient directories.

## Review Output

Preserve Markdown findings plus a minimal fenced JSON trailer:

```json
{
  "verdict": "approve",
  "blockers": []
}
```

## Capability Parity Matrix

The matrix includes rows for review, run, setup, status, result, cancel, gate, model selection, variants, adversarial style, background jobs, sessions, hooks, trailer parsing, and temp handling.
Each row must have one of: planned, implemented, or planned with documented host limitation.

## Future Work

`/claudecode:*` support is deferred to a future plan.
```

- [ ] **Step 4: Self-review product spec**

Run:

```bash
rg -n "TB[D]|TO[D]O|placeholder|may need|maybe|unclear|\\.claude-plugin|\\.claudecode-buddy|CLAUDE_PLUGIN_ROOT|\\$TMPDIR/opencode-prompts|/tmp/opencode-prompts" docs/specs/opencode-plugin.md
```

Expected: no matches.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add docs/specs/opencode-plugin.md
git commit -m "docs: add codex opencode plugin spec"
```

## Task 6: Add Runtime State Ignore And README

**Files:**
- Create: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Add `.gitignore`**

Create `.gitignore` with:

```gitignore
.codex-buddy/
node_modules/
.env
```

- [ ] **Step 2: Update README**

Replace `README.md` with:

```markdown
# codex-buddy

Codex plugins that wrap third-party coding and review CLIs so they can be driven from inside Codex.

The first target is a Codex-native `opencode` plugin with practical parity with `../claudecode-buddy/plugins/opencode`.

Before plugin development, this repo adopts the development workflow from `../claudecode-buddy`.
See `AGENTS.md`, `docs/development-workflow.md`, and `docs/plans/`.
```

- [ ] **Step 3: Verify ignore behavior**

Run:

```bash
printf '.codex-buddy/\n' | git check-ignore --stdin
```

Expected: `.codex-buddy`.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add .gitignore README.md
git commit -m "docs: describe codex buddy workspace"
```

## Task 7: Final Verification And Plan Report

**Files:**
- Modify: `docs/plans/000-workflow-mirror.md`

- [ ] **Step 1: Run documentation verification**

Run:

```bash
test -f docs/development-workflow.md
test -f docs/code-review.md
test -f docs/architecture/decisions.md
test -f docs/specs/opencode-plugin.md
test -f docs/specs/codex-plugin-surface-research.md
printf '.codex-buddy/\n' | git check-ignore --stdin
rg -n "TB[D]|TO[D]O|placeholder|may need|maybe|unclear" docs AGENTS.md README.md
```

Expected: all `test` and `git check-ignore --stdin` commands exit 0.
The `rg` command exits 1 with no matches.

- [ ] **Step 2: Run source-term audit**

Run:

```bash
rg -n "CLAUDE_PLUGIN_ROOT|\\.claude-plugin|\\.claudecode-buddy|\\$TMPDIR/opencode-prompts|/tmp/opencode-prompts|Sonnet|Opus|codex:codex-rescue|/codex:review" docs AGENTS.md README.md
```

Expected: no matches except source-term explanations in the approved design spec or explicit "not copied" notes.

- [ ] **Step 3: Add post-execution report**

Append to this plan:

Add `## Post-Execution Report` with these bullets:

- **Implemented:** workflow docs, code-review docs, architecture decisions, Codex plugin-surface research, Codex-native opencode spec, `.gitignore`, README, and AGENTS.md workflow pointer.
- **Verification:** list the exact verification commands from Steps 1 and 2 and their observed outcomes.
- **Deviations:** record any divergence from the plan, or write `None`.
- **Follow-up:** plan 001 should begin the Codex-native `opencode` plugin parity port.

- [ ] **Step 4: Commit final report**

Run:

```bash
git add docs/plans/000-workflow-mirror.md
git commit -m "docs: record workflow mirror execution report"
```

## Plan Self-Review

- Spec coverage: This plan covers Phase 0 workflow docs, review docs, architecture decisions, Codex-native `opencode` spec baseline, plugin-surface research, AGENTS.md update, `.codex-buddy/` ignore, and temp-file policy.
- Placeholder scan: The plan uses no incomplete placeholder markers.
  External plan-review results are recorded below.
- Type and path consistency: All planned files use `docs/plans/`, `docs/specs/`, `docs/architecture/`, `.codex-buddy/`, and `.agents/plugins/marketplace.json` consistently.

## Plan Review

Date: 2026-05-10

Reviewer: raw `opencode run` with `deepseek/deepseek-v4-pro`.

Initial verdict: `needs-attention`, with no execution-halting blockers.

Resolved findings:

- Created `docs/specs/` before Task 1 writes `docs/specs/codex-plugin-surface-research.md`.
- Added D-007 for handwritten runtime validators before schema dependencies.
- Replaced fragile `git check-ignore .codex-buddy` checks with `printf '.codex-buddy/\n' | git check-ignore --stdin`.
- Added prerequisites for source repo paths, raw opencode, external model reachability, Codex plugin docs, and shell tools.
- Replaced fixed-range `sed` reads with `cat` to avoid silently truncating source docs.
- Documented the temporary `--dangerously-skip-permissions` bootstrapping risk and migration path.
- Quoted `$(pwd)` in raw code-review command templates.

Focused re-review verdict: `approve`.

Focused re-review result: all prior findings resolved; no remaining blockers.
