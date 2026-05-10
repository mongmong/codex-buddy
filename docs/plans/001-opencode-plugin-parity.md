# Opencode Plugin Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Codex-native `opencode` plugin implementation with the shared runtime, project-local state, review/run job lifecycle, and verified Codex plugin surfaces.

**Architecture:** The plugin lives under `plugins/opencode/` and exposes Codex-supported surfaces that call a single Node ESM companion runtime at `plugins/opencode/scripts/buddy.mjs`.
The runtime ports the source plugin behavior from `/home/chris/workshop/claudecode-buddy/plugins/opencode`, but replaces Claude-specific paths and command surfaces with Codex plugin conventions.
All plugin-controlled prompt and task files use `.codex-buddy/opencode/tmp/`, while durable config and background job state use `.codex-buddy/opencode/`.

**Tech Stack:** Codex plugin manifest JSON, repo-local marketplace JSON, Node ESM, `node:test`, raw opencode CLI smoke tests gated by environment variables.

---

## Source Inputs

- Product spec: `docs/specs/001-opencode-plugin.md`
- Plugin surface research: `docs/specs/000-codex-plugin-surface-research.md`
- Workflow rules: `docs/development-workflow.md`
- Architecture decisions: `docs/architecture/decisions.md`
- Source plugin: `/home/chris/workshop/claudecode-buddy/plugins/opencode`
- Source tests: `/home/chris/workshop/claudecode-buddy/tests/opencode`
- Codex plugin manifest reference: `/home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`

## Scope

This plan implements the Codex `opencode` plugin baseline.
It includes runtime behavior, test coverage, docs, marketplace metadata, and Codex-supported plugin surfaces.

This plan does not implement `/claudecode:*` commands.
It does not invent unsupported Codex command or agent manifest formats.
If command or agent surfaces remain unavailable after verification, the plugin ships the runtime plus skills and docs, and the capability matrix records the host limitation.

## Files

Create:

- `package.json`
- `plugins/opencode/.codex-plugin/plugin.json`
- `plugins/opencode/README.md`
- `plugins/opencode/CHANGELOG.md`
- `plugins/opencode/hooks.json`
- `plugins/opencode/skills/opencode-cli-runtime/SKILL.md`
- `plugins/opencode/prompts/adversarial-review.md`
- `plugins/opencode/prompts/stop-review-gate.md`
- `plugins/opencode/schemas/review-trailer.schema.json`
- `plugins/opencode/scripts/buddy.mjs`
- `plugins/opencode/scripts/stop-review-gate-hook.mjs`
- `plugins/opencode/scripts/lib/args.mjs`
- `plugins/opencode/scripts/lib/cli-detection.mjs`
- `plugins/opencode/scripts/lib/config-detection.mjs`
- `plugins/opencode/scripts/lib/config.mjs`
- `plugins/opencode/scripts/lib/git.mjs`
- `plugins/opencode/scripts/lib/invoke.mjs`
- `plugins/opencode/scripts/lib/jobs.mjs`
- `plugins/opencode/scripts/lib/list-models.mjs`
- `plugins/opencode/scripts/lib/prompt.mjs`
- `plugins/opencode/scripts/lib/review-dispatch.mjs`
- `plugins/opencode/scripts/lib/scope.mjs`
- `plugins/opencode/scripts/lib/session-capture.mjs`
- `plugins/opencode/scripts/lib/sessions.mjs`
- `plugins/opencode/scripts/lib/supervisor.mjs`
- `plugins/opencode/scripts/lib/trailer.mjs`
- `tests/opencode/helpers.mjs`
- `tests/opencode/*.test.mjs`

Modify:

- `.agents/plugins/marketplace.json`
- `.gitignore`
- `README.md`
- `docs/specs/000-codex-plugin-surface-research.md`
- `docs/specs/001-opencode-plugin.md`
- `docs/plans/001-opencode-plugin-parity.md`

## Task 1: Verify Codex Plugin Surfaces

**Files:**
- Modify: `docs/specs/000-codex-plugin-surface-research.md`
- Modify: `docs/specs/001-opencode-plugin.md`

- [ ] **Step 1: Inspect local Codex plugin examples**

Run:

```bash
find /home/chris/.codex/.tmp/plugins/plugins -maxdepth 4 -type f | sort
```

Expected: output includes installed plugin examples with `.codex-plugin/plugin.json`, skills, scripts, hooks, and app or MCP files.

- [ ] **Step 2: Search for command or agent surface examples**

Run:

```bash
rg -n '"commands"|"agents"|commands/|agents/' /home/chris/.codex/.tmp/plugins /home/chris/.codex/skills/.system/plugin-creator
```

Expected: either concrete evidence for Codex command or agent surfaces, or no evidence.

- [ ] **Step 3: Update surface research**

Edit `docs/specs/000-codex-plugin-surface-research.md`.
Record one of these outcomes:

```markdown
### Commands And Agents

The local Codex plugin references do not expose a command or agent manifest convention.
This implementation therefore exposes a skill-backed runtime surface and keeps command and agent parity marked as planned with documented host limitation.
```

or:

```markdown
### Commands And Agents

The local Codex plugin references expose the following command or agent surface:

- `<verified path and field>`

This implementation uses that surface for the supported `opencode` commands.
```

- [ ] **Step 4: Update the capability matrix**

Edit `docs/specs/001-opencode-plugin.md`.
For each capability row, set the Codex status to one of:

- `implemented`
- `implemented via skill-backed runtime`
- `planned with documented host limitation`

Expected: no capability row remains ambiguous about whether it is implemented or blocked by host support.

- [ ] **Step 5: Verify docs**

Run:

```bash
rg -n "TB[D]|TO[D]O|place[h]older|may ne[e]d|ma[y]be|uncl[e]ar" docs/specs/000-codex-plugin-surface-research.md docs/specs/001-opencode-plugin.md
```

Expected: exit 1 with no matches.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add docs/specs/000-codex-plugin-surface-research.md docs/specs/001-opencode-plugin.md
git commit -m "docs: verify codex opencode surfaces"
```

## Task 2: Add Workspace Test Harness And Plugin Scaffold

**Files:**
- Create: `package.json`
- Create: `.agents/plugins/marketplace.json`
- Create: `plugins/opencode/.codex-plugin/plugin.json`
- Create: `plugins/opencode/README.md`
- Create: `plugins/opencode/CHANGELOG.md`
- Modify: `.gitignore`

- [ ] **Step 1: Create workspace package metadata**

Create `package.json`:

```json
{
  "name": "codex-buddy",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18.18.0"
  },
  "scripts": {
    "test": "node --test tests/**/*.test.mjs"
  }
}
```

- [ ] **Step 2: Create marketplace metadata**

Create `.agents/plugins/marketplace.json`:

```json
{
  "name": "codex-buddy",
  "interface": {
    "displayName": "Codex Buddy"
  },
  "plugins": [
    {
      "name": "opencode",
      "source": {
        "source": "local",
        "path": "./plugins/opencode"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_USE"
      },
      "category": "Developer Tools"
    }
  ]
}
```

- [ ] **Step 3: Create Codex plugin manifest**

Create `plugins/opencode/.codex-plugin/plugin.json`:

```json
{
  "name": "opencode",
  "version": "0.1.0",
  "description": "Use opencode from Codex for code review, investigation, and delegated CLI runs.",
  "author": {
    "name": "codex-buddy"
  },
  "license": "MIT",
  "keywords": ["codex", "opencode", "review", "automation"],
  "skills": "./skills/",
  "hooks": "./hooks.json",
  "interface": {
    "displayName": "opencode",
    "shortDescription": "Run opencode review and delegation workflows from Codex.",
    "longDescription": "Codex-native wrapper around the opencode CLI with review, run, setup, status, result, cancel, and gate support where Codex plugin surfaces allow it.",
    "developerName": "codex-buddy",
    "category": "Developer Tools",
    "capabilities": ["Review", "CLI", "Automation"],
    "defaultPrompt": [
      "Review this branch with opencode.",
      "Run an opencode task in the background.",
      "Check opencode setup diagnostics."
    ],
    "brandColor": "#2563EB"
  }
}
```

- [ ] **Step 4: Create plugin docs**

Create `plugins/opencode/README.md`:

````markdown
# opencode

Codex plugin for running opencode review, investigation, and delegated CLI workflows.

The shared runtime is `scripts/buddy.mjs`.
Durable plugin state lives under `.codex-buddy/opencode/`.
Transient prompt and task files live under `.codex-buddy/opencode/tmp/` and are pruned by the runtime.

Until Codex command and agent manifests are verified, use the bundled skill instructions and direct runtime commands:

```bash
node plugins/opencode/scripts/buddy.mjs setup
node plugins/opencode/scripts/buddy.mjs review --scope branch --model opencode-go/deepseek-v4-flash
node plugins/opencode/scripts/buddy.mjs run --task "Inspect the current branch" --model opencode-go/glm-5.1 --background
```
````

Create `plugins/opencode/CHANGELOG.md`:

```markdown
# Changelog

## 0.1.0

- Initial Codex-native opencode plugin runtime.
```

- [ ] **Step 5: Update gitignore**

Ensure `.gitignore` contains:

```gitignore
node_modules/
.codex-buddy/
```

- [ ] **Step 6: Verify scaffold JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.agents/plugins/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('plugins/opencode/.codex-plugin/plugin.json','utf8'))"
```

Expected: exit 0.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add package.json .agents/plugins/marketplace.json plugins/opencode/.codex-plugin/plugin.json plugins/opencode/README.md plugins/opencode/CHANGELOG.md .gitignore
git commit -m "feat: scaffold opencode codex plugin"
```

## Task 3: Port Runtime Core With Project-Local State

**Files:**
- Create runtime files under `plugins/opencode/scripts/`
- Create tests under `tests/opencode/`

- [ ] **Step 1: Copy source runtime and tests**

Run:

```bash
mkdir -p plugins/opencode/scripts/lib tests/opencode plugins/opencode/prompts plugins/opencode/schemas
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/buddy.mjs plugins/opencode/scripts/buddy.mjs
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/lib/*.mjs plugins/opencode/scripts/lib/
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/prompts/*.md plugins/opencode/prompts/
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/schemas/*.json plugins/opencode/schemas/
cp /home/chris/workshop/claudecode-buddy/tests/opencode/helpers.mjs tests/opencode/helpers.mjs
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{args,cli-detection,config-detection,config,invoke,jobs,list-models,prompt,review-dispatch,scope,session-capture,sessions,trailer}.test.mjs tests/opencode/
```

Expected: files exist in the Codex plugin tree.

- [ ] **Step 2: Replace state directory names**

In runtime and tests, replace `.claudecode-buddy` with `.codex-buddy`.
Keep source repo references in docs untouched.

Run:

```bash
rg -n "\\.claudecode-buddy" plugins/opencode tests/opencode
```

Expected after edits: no matches.

- [ ] **Step 3: Replace system temp prompt handling**

Replace the source `allowedPromptDir()` and task-file validation behavior with project-local runtime paths:

- `runtimeRoot(projectDir)` returns `<projectDir>/.codex-buddy/opencode`.
- `tmpRoot(projectDir)` returns `<projectDir>/.codex-buddy/opencode/tmp`.
- `jobsDir(projectDir)` stays under `<projectDir>/.codex-buddy/opencode/jobs`.
- Prompt and task files are accepted only under `tmpRoot(projectDir)`.
- Foreground commands remove their per-run transient directory before returning.
- Startup or command entry prunes stale transient directories older than 24 hours.

Run:

```bash
rg -n "TMPDIR|/tmp|opencode-prompts|allowedPromptDir" plugins/opencode/scripts tests/opencode
```

Expected: matches only in tests that assert rejected legacy paths or docs strings explaining the legacy source behavior.

- [ ] **Step 4: Run core tests**

Run:

```bash
npm test -- tests/opencode/args.test.mjs tests/opencode/config.test.mjs tests/opencode/jobs.test.mjs tests/opencode/trailer.test.mjs
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add plugins/opencode/scripts plugins/opencode/prompts plugins/opencode/schemas tests/opencode
git commit -m "feat: port opencode runtime core"
```

## Task 4: Port Review And Setup Workflows

**Files:**
- Modify: `plugins/opencode/scripts/buddy.mjs`
- Modify: `plugins/opencode/scripts/lib/prompt.mjs`
- Modify: `plugins/opencode/scripts/lib/review-dispatch.mjs`
- Modify: `plugins/opencode/scripts/lib/scope.mjs`
- Create or modify review/setup tests under `tests/opencode/`
- Create: `plugins/opencode/skills/opencode-cli-runtime/SKILL.md`

- [ ] **Step 1: Copy review and setup tests**

Run:

```bash
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{review-cmd,setup-cmd,models-cmd,variant}.test.mjs tests/opencode/
```

- [ ] **Step 2: Adjust prompts for Codex**

Edit prompt builders so review prompts reference:

- `AGENTS.md`
- `docs/development-workflow.md`
- `docs/architecture/decisions.md`

They must not reference Claude-only command names except in source-compatibility notes.

- [ ] **Step 3: Add skill-backed runtime instructions**

Create `plugins/opencode/skills/opencode-cli-runtime/SKILL.md`:

````markdown
---
name: opencode-cli-runtime
description: Use when Codex needs to run opencode review, investigation, setup, status, result, cancel, gate, or delegated run workflows through this plugin runtime.
---

# opencode CLI Runtime

Use `node plugins/opencode/scripts/buddy.mjs <subcommand>` from the repository root.

Supported subcommands:

- `setup`
- `review`
- `run`
- `status`
- `result`
- `cancel`
- `gate`

Use project-local state under `.codex-buddy/opencode/`.
Do not create plugin-controlled prompt or task files under `/tmp`.

For review gates, prefer:

```bash
node plugins/opencode/scripts/buddy.mjs review --scope branch --model opencode-go/deepseek-v4-flash
node plugins/opencode/scripts/buddy.mjs review --scope branch --model opencode-go/glm-5.1
node plugins/opencode/scripts/buddy.mjs review --scope branch --model opencode-go/kimi-k2.6
```

For investigations, use read-only prompts and `--model opencode-go/deepseek-v4-pro` or `--model opencode-go/glm-5.1`.
````

- [ ] **Step 4: Run review/setup tests**

Run:

```bash
npm test -- tests/opencode/review-cmd.test.mjs tests/opencode/setup-cmd.test.mjs tests/opencode/models-cmd.test.mjs tests/opencode/variant.test.mjs
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add plugins/opencode/scripts plugins/opencode/skills tests/opencode
git commit -m "feat: add opencode review setup workflows"
```

## Task 5: Port Run, Background Jobs, And Cancellation

**Files:**
- Modify: `plugins/opencode/scripts/buddy.mjs`
- Modify: `plugins/opencode/scripts/lib/invoke.mjs`
- Modify: `plugins/opencode/scripts/lib/jobs.mjs`
- Modify: `plugins/opencode/scripts/lib/supervisor.mjs`
- Create or modify tests under `tests/opencode/`

- [ ] **Step 1: Copy job lifecycle tests**

Run:

```bash
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{run-cmd,status-cmd,result-cmd,cancel-cmd,e2e}.test.mjs tests/opencode/
```

- [ ] **Step 2: Preserve run command behavior**

Port run behavior with these requirements:

- `run --task <text>` runs foreground opencode.
- `run --task-file <path>` reads a file only when it is under `.codex-buddy/opencode/tmp/`.
- `run --background` creates durable job metadata under `.codex-buddy/opencode/jobs/`.
- `status`, `result`, and `cancel` operate on durable job metadata.
- Background stdout and stderr are stored under the job directory, not under the transient tmp directory.

- [ ] **Step 3: Verify no routine system temp dependency**

Run:

```bash
rg -n "TMPDIR|/tmp|opencode-prompts" plugins/opencode/scripts tests/opencode
```

Expected: no runtime path uses system temp for plugin-controlled prompt or task files.

- [ ] **Step 4: Run job lifecycle tests**

Run:

```bash
npm test -- tests/opencode/run-cmd.test.mjs tests/opencode/status-cmd.test.mjs tests/opencode/result-cmd.test.mjs tests/opencode/cancel-cmd.test.mjs tests/opencode/jobs.test.mjs
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add plugins/opencode/scripts tests/opencode
git commit -m "feat: add opencode run job lifecycle"
```

## Task 6: Port Hooks And Review Gate

**Files:**
- Create: `plugins/opencode/hooks.json`
- Create: `plugins/opencode/scripts/stop-review-gate-hook.mjs`
- Modify: `plugins/opencode/scripts/buddy.mjs`
- Create or modify tests under `tests/opencode/`
- Modify: `docs/specs/001-opencode-plugin.md`

- [ ] **Step 1: Copy hook files and tests**

Run:

```bash
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/hooks.json plugins/opencode/hooks.json
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/stop-review-gate-hook.mjs plugins/opencode/scripts/stop-review-gate-hook.mjs
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{gate-cmd,hooks,stop-gate}.test.mjs tests/opencode/
```

- [ ] **Step 2: Adapt hook configuration**

Edit `plugins/opencode/hooks.json` to match verified Codex hook conventions.
If the verified Codex hook events do not match the source plugin's session lifecycle, keep the hook file conservative and document the host limitation in `docs/specs/001-opencode-plugin.md`.

- [ ] **Step 3: Run hook tests**

Run:

```bash
npm test -- tests/opencode/gate-cmd.test.mjs tests/opencode/hooks.test.mjs tests/opencode/stop-gate.test.mjs
```

Expected: all selected tests pass, or hook host limitations are documented with tests proving the runtime pieces still work.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add plugins/opencode/hooks.json plugins/opencode/scripts plugins/opencode/scripts/stop-review-gate-hook.mjs tests/opencode docs/specs/001-opencode-plugin.md
git commit -m "feat: add opencode review gate hooks"
```

## Task 7: Documentation And Full Verification

**Files:**
- Modify: `README.md`
- Modify: `plugins/opencode/README.md`
- Modify: `docs/specs/001-opencode-plugin.md`
- Modify: `docs/plans/001-opencode-plugin-parity.md`

- [ ] **Step 1: Update root README**

Add a section that points to:

- `plugins/opencode/README.md`
- `docs/specs/001-opencode-plugin.md`
- `docs/development-workflow.md`

- [ ] **Step 2: Update plugin README**

Document:

- setup command
- review command examples
- run command examples
- status/result/cancel examples
- gate configuration
- `.codex-buddy/opencode/` state layout
- `.codex-buddy/opencode/tmp/` transient storage policy
- host limitations for commands, agents, or hooks that are not verified

- [ ] **Step 3: Run full tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Run documentation audits**

Run:

```bash
rg -n "TB[D]|TO[D]O|place[h]older|may ne[e]d|ma[y]be|uncl[e]ar" README.md plugins/opencode docs/specs/001-opencode-plugin.md
rg -n "\\.claudecode-budd[y]|\\.claude-plugi[n]|CLAUDE_PLUGIN_ROO[T]|\\$TMPDIR/opencode-prompt[s]|/tmp/opencode-prompt[s]|deeps[e]ek/|volcengine-pla[n]/|kimi-k2\\.[5]" README.md plugins/opencode docs/specs/001-opencode-plugin.md
```

Expected: both commands exit 1 with no matches, except source-compatibility notes in plan prose that explicitly explain rejected source behavior.

- [ ] **Step 5: Run optional live opencode smoke tests**

Run only when the user confirms live CLI smoke tests for this plan:

```bash
OPENCODE_E2E=1 npm test -- tests/opencode/e2e.test.mjs
```

Expected: live tests pass when opencode credentials and models are configured.

- [ ] **Step 6: Add post-execution report**

Append `## Post-Execution Report` to this plan with:

- implemented behavior
- tests run and observed results
- host limitations
- deviations from plan
- follow-up work

- [ ] **Step 7: Commit Task 7**

Run:

```bash
git add README.md plugins/opencode docs/specs/001-opencode-plugin.md docs/plans/001-opencode-plugin-parity.md
git commit -m "docs: document opencode plugin parity"
```

## Plan Self-Review

- Spec coverage: This plan covers plugin scaffold, marketplace metadata, runtime core, review, run, setup, status, result, cancel, gate, hooks, docs, tests, and `/tmp` avoidance.
- Host-surface realism: The plan verifies Codex command and agent support before claiming command or agent parity.
- Temp-file policy: The plan replaces `${TMPDIR:-/tmp}/opencode-prompts` with `.codex-buddy/opencode/tmp/` and tests that plugin-controlled prompt/task files stay project-local.
- Testing: Each implementation task ports or adds focused `node:test` coverage before committing.

## Plan Review

Plan review must use the gate in `docs/development-workflow.md` before implementation starts:

- Codex self-review
- `opencode-go/deepseek-v4-pro`
- `opencode-go/glm-5.1`
- `opencode-go/kimi-k2.6`

Record reviewer findings and resolutions below before beginning Task 1.
