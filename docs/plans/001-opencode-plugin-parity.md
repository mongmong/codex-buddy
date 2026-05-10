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
- `plugins/opencode/hooks/session-start.mjs`
- `plugins/opencode/hooks/session-end.mjs`
- `plugins/opencode/agents/opencode-review.md`
- `plugins/opencode/agents/opencode-run.md`
- `plugins/opencode/commands/review.md`
- `plugins/opencode/commands/run.md`
- `plugins/opencode/commands/setup.md`
- `plugins/opencode/commands/status.md`
- `plugins/opencode/commands/result.md`
- `plugins/opencode/commands/cancel.md`
- `plugins/opencode/commands/gate.md`
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
- `tests/opencode/fixtures/*.mjs`
- `tests/opencode/*.test.mjs`

Modify:

- `.agents/plugins/marketplace.json`
- `.gitignore`
- `README.md`
- `docs/specs/000-codex-plugin-surface-research.md`
- `docs/specs/001-opencode-plugin.md`
- `docs/architecture/decisions.md`
- `docs/plans/001-opencode-plugin-parity.md`

## Pre-Implementation Gate

Do not begin Task 1 until all Plan Review Round 2 reviewers approve or all remaining blockers are resolved and re-reviewed.

- [ ] **Step 1: Confirm plan review approval**

Verify the `## Plan Review` section records Codex self-review plus DeepSeek, GLM, and Kimi verdicts.

- [ ] **Step 2: Commit the reviewed plan**

Run:

```bash
git add docs/plans/001-opencode-plugin-parity.md
git commit -m "docs: approve opencode plugin parity plan"
```

Expected: a reviewed-plan commit exists immediately before implementation begins.
If the plan review section is already committed and `git status --short` is clean, record that commit SHA in the implementation notes before starting Task 1.

## Task 1: Verify Codex Plugin Surfaces

**Files:**
- Modify: `docs/specs/000-codex-plugin-surface-research.md`
- Modify: `docs/specs/001-opencode-plugin.md`

- [ ] **Step 1: Verify required local source inputs**

Run:

```bash
test -d /home/chris/workshop/claudecode-buddy/plugins/opencode
test -d /home/chris/workshop/claudecode-buddy/tests/opencode
test -f /home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md
```

Expected: all commands exit 0.
If a source path is missing, stop and update the source input paths before continuing.

- [ ] **Step 2: Inspect local Codex plugin examples**

Run:

```bash
if test -d /home/chris/.codex/.tmp/plugins/plugins; then
  find /home/chris/.codex/.tmp/plugins/plugins -maxdepth 4 -type f | sort
else
  echo "No local Codex tmp plugin examples found"
fi
```

Expected: output includes installed plugin examples with `.codex-plugin/plugin.json`, skills, scripts, hooks, and app or MCP files, or prints the explicit no-examples message.

- [ ] **Step 3: Search for command, agent, hook, and skill surface examples**

Run:

```bash
if test -d /home/chris/.codex/.tmp/plugins; then
  rg -n '"commands"|"agents"|"hooks"|commands/|agents/|hooks/|skills/' /home/chris/.codex/.tmp/plugins /home/chris/.codex/skills/.system/plugin-creator
else
  rg -n '"commands"|"agents"|"hooks"|commands/|agents/|hooks/|skills/' /home/chris/.codex/skills/.system/plugin-creator
fi
```

Expected: concrete evidence for any Codex command, agent, hook, and skill directory surfaces, or no evidence for that surface.

- [ ] **Step 4: Update surface research**

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

Also record a hook and skill-layout outcome:

```markdown
### Hooks

The local Codex plugin references expose `<verified hook path or field>`.
This implementation uses only the verified hook events and leaves unsupported source hook behavior documented as a host limitation.
```

or:

```markdown
### Hooks

The local Codex plugin references do not expose concrete hook event names.
This implementation ships runtime gate support but does not install active lifecycle hooks until Codex hook events are verified.
```

For skills, verify whether nested `skills/<name>/SKILL.md` is supported by the plugin manifest reference.
If it is not supported, update this plan before Task 4 to use the verified skill layout.
If command and agent directories are verified, keep the command and agent copy steps in Tasks 4, 5, and 6 active.

- [ ] **Step 5: Update the capability matrix**

Edit `docs/specs/001-opencode-plugin.md`.
For each capability row, set the Codex status to one of:

- `implemented`
- `implemented via skill-backed runtime`
- `planned with documented host limitation`

Expected: no capability row remains ambiguous about whether it is implemented or blocked by host support.

- [ ] **Step 6: Verify docs**

Run:

```bash
rg -n "TB[D]|TO[D]O|place[h]older|may ne[e]d|ma[y]be|uncl[e]ar" docs/specs/000-codex-plugin-surface-research.md docs/specs/001-opencode-plugin.md
```

Expected: exit 1 with no matches.

- [ ] **Step 7: Commit Task 1**

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
    "test": "node --test tests/opencode"
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

Run:

```bash
grep -qxF "node_modules/" .gitignore || printf "node_modules/\n" >> .gitignore
grep -qxF ".codex-buddy/" .gitignore || printf ".codex-buddy/\n" >> .gitignore
```

- [ ] **Step 6: Verify scaffold JSON**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; JSON.parse(fs.readFileSync('package.json','utf8')); JSON.parse(fs.readFileSync('.agents/plugins/marketplace.json','utf8')); JSON.parse(fs.readFileSync('plugins/opencode/.codex-plugin/plugin.json','utf8'))"
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

- [ ] **Step 1: Verify source runtime and test files**

Run:

```bash
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/buddy.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/lib/config.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/lib/jobs.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/helpers.mjs
test -d /home/chris/workshop/claudecode-buddy/tests/opencode/fixtures
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/prompt-cmd.test.mjs
```

Expected: all commands exit 0.
If any command fails, update this plan with the new source path or intentionally remove that source file from scope before copying.

- [ ] **Step 2: Copy source runtime and tests**

Run:

```bash
mkdir -p plugins/opencode/scripts/lib tests/opencode plugins/opencode/prompts plugins/opencode/schemas
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/buddy.mjs plugins/opencode/scripts/buddy.mjs
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/lib/*.mjs plugins/opencode/scripts/lib/
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/prompts/*.md plugins/opencode/prompts/
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/schemas/*.json plugins/opencode/schemas/
cp /home/chris/workshop/claudecode-buddy/tests/opencode/helpers.mjs tests/opencode/helpers.mjs
cp -R /home/chris/workshop/claudecode-buddy/tests/opencode/fixtures tests/opencode/fixtures
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{args,cli-detection,config-detection,config,invoke,jobs,list-models,prompt,prompt-cmd,review-dispatch,scope,session-capture,sessions,trailer}.test.mjs tests/opencode/
```

Expected: files exist in the Codex plugin tree.
The repository is expected to be in an unadapted intermediate state after this copy step; do not test or commit until Steps 3 and 4 complete.

- [ ] **Step 3: Replace state directory names**

In runtime and tests, replace `.claudecode-buddy` with `.codex-buddy`.
Replace source `CLAUDE_PROJECT_DIR` handling in copied runtime and tests with Codex-local project resolution:

```javascript
function projectDirFromEnv(cwd = process.cwd()) {
  return process.env.CODEX_PROJECT_DIR ?? cwd;
}
```

Use `projectDirFromEnv(cwd)` at the copied `buddy.mjs` project-dir call sites.
In tests, pass `CODEX_PROJECT_DIR` instead of `CLAUDE_PROJECT_DIR`.
Keep source repo references in docs untouched.

Run:

```bash
rg -n "\\.claudecode-buddy" plugins/opencode tests/opencode
rg -n "CLAUDE_PROJECT_DIR" plugins/opencode tests/opencode
```

Expected after edits: both commands exit 1 with no matches.

- [ ] **Step 4: Replace system temp prompt handling**

In `plugins/opencode/scripts/buddy.mjs`, replace the source `allowedPromptDir()` and task-file validation behavior with project-local runtime paths:

- `runtimeRoot(projectDir)` returns `<projectDir>/.codex-buddy/opencode`.
- `tmpRoot(projectDir)` returns `<projectDir>/.codex-buddy/opencode/tmp`.
- `jobsDir(projectDir)` stays under `<projectDir>/.codex-buddy/opencode/jobs`.
- Prompt and task files are accepted only under `tmpRoot(projectDir)`.
- Foreground commands remove their per-run transient directory before returning.
- Startup or command entry prunes stale transient directories older than 24 hours.
- Error messages refer to `.codex-buddy/opencode/tmp/`, not `$TMPDIR/opencode-prompts/`.

Concrete replacement target:

```javascript
function runtimeRoot(projectDir) {
  return join(projectDir, ".codex-buddy", "opencode");
}

function tmpRoot(projectDir) {
  return join(runtimeRoot(projectDir), "tmp");
}
```

Update `isUnderAllowedDir`, `readTaskFileFdBound`, `parsePromptArgs`, and `parseRunArgs` call sites to pass the detected project directory into path validation.
Update `tests/opencode/prompt-cmd.test.mjs` so allowed files are created under `<repoDir>/.codex-buddy/opencode/tmp/` instead of `${TMPDIR}/opencode-prompts/`.

Run:

```bash
rg -n "TMPDIR|/tmp|opencode-prompts|allowedPromptDir" plugins/opencode/scripts tests/opencode
```

Expected: matches only in tests that assert rejected legacy paths or docs strings explaining the legacy source behavior.

- [ ] **Step 5: Run core tests**

Run:

```bash
npm test -- tests/opencode/args.test.mjs tests/opencode/cli-detection.test.mjs tests/opencode/config-detection.test.mjs tests/opencode/config.test.mjs tests/opencode/invoke.test.mjs tests/opencode/jobs.test.mjs tests/opencode/list-models.test.mjs tests/opencode/prompt.test.mjs tests/opencode/prompt-cmd.test.mjs tests/opencode/review-dispatch.test.mjs tests/opencode/scope.test.mjs tests/opencode/session-capture.test.mjs tests/opencode/sessions.test.mjs tests/opencode/trailer.test.mjs
```

Expected: all selected tests pass.

- [ ] **Step 6: Commit Task 3**

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
- Create: `plugins/opencode/agents/opencode-review.md`
- Create: `plugins/opencode/commands/review.md`
- Create: `plugins/opencode/commands/setup.md`
- Create or modify review/setup tests under `tests/opencode/`
- Create: `plugins/opencode/skills/opencode-cli-runtime/SKILL.md`

- [ ] **Step 1: Verify review and setup source tests**

Run:

```bash
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/review-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/setup-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/models-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/variant.test.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/agents/opencode-review.md
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/review.md
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/setup.md
```

Expected: all commands exit 0.

- [ ] **Step 2: Copy review and setup tests**

Run:

```bash
mkdir -p plugins/opencode/agents plugins/opencode/commands
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/agents/opencode-review.md plugins/opencode/agents/opencode-review.md
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/{review,setup}.md plugins/opencode/commands/
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{review-cmd,setup-cmd,models-cmd,variant}.test.mjs tests/opencode/
```

- [ ] **Step 3: Adjust prompts for Codex**

Keep `plugins/opencode/scripts/lib/prompt.mjs` generic and portable.
Do not hard-code Codex Buddy project files such as `AGENTS.md`, `docs/development-workflow.md`, or `docs/architecture/decisions.md` into runtime prompt builders.
Edit copied command and agent files so examples use Codex command names, direct runtime invocations where necessary, and generic language about honoring the current repository's own instructions.

- [ ] **Step 4: Add skill-backed runtime instructions**

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

- [ ] **Step 5: Run review/setup tests**

Run:

```bash
npm test -- tests/opencode/review-cmd.test.mjs tests/opencode/setup-cmd.test.mjs tests/opencode/models-cmd.test.mjs tests/opencode/variant.test.mjs
```

Expected: all selected tests pass.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add plugins/opencode/scripts plugins/opencode/skills plugins/opencode/agents plugins/opencode/commands tests/opencode
git commit -m "feat: add opencode review setup workflows"
```

## Task 5: Port Run, Background Jobs, And Cancellation

**Files:**
- Modify: `plugins/opencode/scripts/buddy.mjs`
- Modify: `plugins/opencode/scripts/lib/invoke.mjs`
- Modify: `plugins/opencode/scripts/lib/jobs.mjs`
- Modify: `plugins/opencode/scripts/lib/supervisor.mjs`
- Create: `plugins/opencode/agents/opencode-run.md`
- Create: `plugins/opencode/commands/run.md`
- Create: `plugins/opencode/commands/status.md`
- Create: `plugins/opencode/commands/result.md`
- Create: `plugins/opencode/commands/cancel.md`
- Create or modify tests under `tests/opencode/`

- [x] **Step 1: Verify job lifecycle source tests**

Run:

```bash
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/run-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/status-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/result-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/cancel-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/e2e.test.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/agents/opencode-run.md
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/run.md
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/status.md
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/result.md
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/cancel.md
```

Expected: all commands exit 0.

- [x] **Step 2: Copy job lifecycle tests**

Run:

```bash
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/agents/opencode-run.md plugins/opencode/agents/opencode-run.md
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/{run,status,result,cancel}.md plugins/opencode/commands/
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{run-cmd,status-cmd,result-cmd,cancel-cmd,e2e}.test.mjs tests/opencode/
```

- [x] **Step 3: Preserve run command behavior**

Port run behavior with these requirements:

- `run --task <text>` runs foreground opencode.
- `run --task-file <path>` reads a file only when it is under `.codex-buddy/opencode/tmp/`.
- `run --background` creates durable job metadata under `.codex-buddy/opencode/jobs/`.
- `status`, `result`, and `cancel` operate on durable job metadata.
- Background stdout and stderr are stored under the job directory, not under the transient tmp directory.
- `tests/opencode/run-cmd.test.mjs` creates allowed task files under `<repoDir>/.codex-buddy/opencode/tmp/` instead of `${TMPDIR}/opencode-prompts/`.
- `tests/opencode/run-cmd.test.mjs`, `status-cmd.test.mjs`, `result-cmd.test.mjs`, and `cancel-cmd.test.mjs` pass `CODEX_PROJECT_DIR` instead of `CLAUDE_PROJECT_DIR`.
- Copied `run`, `status`, `result`, and `cancel` command docs call `node plugins/opencode/scripts/buddy.mjs <subcommand>` and do not reference Claude-only variables.

- [x] **Step 4: Verify no routine system temp dependency**

Run:

```bash
rg -n "TMPDIR|/tmp|opencode-prompts" plugins/opencode/scripts tests/opencode
```

Expected: no runtime path uses system temp for plugin-controlled prompt or task files.

- [x] **Step 5: Run job lifecycle tests**

Run:

```bash
npm test -- tests/opencode/run-cmd.test.mjs tests/opencode/status-cmd.test.mjs tests/opencode/result-cmd.test.mjs tests/opencode/cancel-cmd.test.mjs tests/opencode/jobs.test.mjs
```

Expected: all selected tests pass.

- [x] **Step 6: Commit Task 5**

Run:

```bash
git add plugins/opencode/scripts plugins/opencode/agents plugins/opencode/commands tests/opencode
git commit -m "feat: add opencode run job lifecycle"
```

## Task 6: Port Hooks And Review Gate

**Files:**
- Create: `plugins/opencode/hooks.json`
- Create: `plugins/opencode/hooks/session-start.mjs`
- Create: `plugins/opencode/hooks/session-end.mjs`
- Create: `plugins/opencode/scripts/stop-review-gate-hook.mjs`
- Create: `plugins/opencode/commands/gate.md`
- Modify: `plugins/opencode/scripts/buddy.mjs`
- Create or modify tests under `tests/opencode/`
- Modify: `docs/specs/001-opencode-plugin.md`

- [x] **Step 1: Verify hook source files and tests**

Run:

```bash
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/hooks.json
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/session-start.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/session-end.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/stop-review-gate-hook.mjs
test -f /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/gate.md
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/gate-cmd.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/hooks.test.mjs
test -f /home/chris/workshop/claudecode-buddy/tests/opencode/stop-gate.test.mjs
```

Expected: all commands exit 0.

- [x] **Step 2: Copy hook files and tests**

Run:

```bash
mkdir -p plugins/opencode/hooks
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/hooks.json plugins/opencode/hooks.json
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/session-start.mjs plugins/opencode/hooks/session-start.mjs
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/hooks/session-end.mjs plugins/opencode/hooks/session-end.mjs
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/scripts/stop-review-gate-hook.mjs plugins/opencode/scripts/stop-review-gate-hook.mjs
cp /home/chris/workshop/claudecode-buddy/plugins/opencode/commands/gate.md plugins/opencode/commands/gate.md
cp /home/chris/workshop/claudecode-buddy/tests/opencode/{gate-cmd,hooks,stop-gate}.test.mjs tests/opencode/
```

- [x] **Step 3: Adapt hook configuration**

Edit `plugins/opencode/hooks.json` to match verified Codex hook conventions.
If Task 1 verifies Codex event names and a plugin-root variable, use only those verified names and update commands away from `CLAUDE_PLUGIN_ROOT`.

If Task 1 does not verify Codex hook event names or a plugin-root variable, make the hook file conservative:

```json
{
  "description": "opencode runtime hooks are available, but active Codex hook events are disabled until the host event contract is verified.",
  "hooks": {}
}
```

In that conservative path, keep `plugins/opencode/hooks/session-start.mjs`, `plugins/opencode/hooks/session-end.mjs`, and `plugins/opencode/scripts/stop-review-gate-hook.mjs` as directly testable runtime helpers, and document active hook installation as a host limitation in `docs/specs/001-opencode-plugin.md`.
The copied `session-start.mjs`, `session-end.mjs`, and `stop-review-gate-hook.mjs` must replace `CLAUDE_PROJECT_DIR` with `CODEX_PROJECT_DIR` fallback handling.
The stop hook must also replace `.claudecode-buddy/` self-edit checks and messages with `.codex-buddy/`.

Run:

```bash
rg -n "CLAUDE_PROJECT_DIR|\\.claudecode-buddy" plugins/opencode/hooks plugins/opencode/scripts/stop-review-gate-hook.mjs tests/opencode/hooks.test.mjs tests/opencode/stop-gate.test.mjs
```

Expected: exit 1 with no matches.

- [x] **Step 4: Run hook tests**

Run:

```bash
npm test -- tests/opencode/gate-cmd.test.mjs tests/opencode/hooks.test.mjs tests/opencode/stop-gate.test.mjs
```

Expected: all selected tests pass, or hook host limitations are documented with tests proving the runtime pieces still work.

- [x] **Step 5: Commit Task 6**

Run:

```bash
git add plugins/opencode/hooks.json plugins/opencode/hooks plugins/opencode/scripts plugins/opencode/scripts/stop-review-gate-hook.mjs plugins/opencode/commands tests/opencode docs/specs/001-opencode-plugin.md
git commit -m "feat: add opencode review gate hooks"
```

## Task 7: Documentation And Full Verification

**Files:**
- Modify: `README.md`
- Modify: `plugins/opencode/README.md`
- Modify: `docs/specs/001-opencode-plugin.md`
- Modify: `docs/plans/001-opencode-plugin-parity.md`
- Modify: `docs/architecture/decisions.md`
- Modify: `docs/architecture/decisions.md`

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

Expected: both commands exit 1 with no matches.

- [ ] **Step 5: Check architecture decisions and backlog**

Run:

```bash
ls docs
test -f docs/architecture/decisions.md
```

Expected: `docs/architecture/decisions.md` exists.

If implementation introduced lasting decisions not already recorded, append them to `docs/architecture/decisions.md` with a link to `docs/specs/001-opencode-plugin.md` or this plan.
If a project backlog file exists under `docs/` or the repository root, update it with unresolved follow-up work such as `/claudecode:*` command support.

- [ ] **Step 6: Run optional live opencode smoke tests**

Run only when the user confirms live CLI smoke tests for this plan:

```bash
OPENCODE_E2E=1 npm test -- tests/opencode/e2e.test.mjs
```

Expected: live tests pass when opencode credentials and models are configured.

- [ ] **Step 7: Run code review gate**

After implementation, full tests, and docs audits pass, dispatch the workflow code review gate:

- Codex self-review
- raw `opencode-go/deepseek-v4-flash`
- raw `opencode-go/glm-5.1`
- raw `opencode-go/kimi-k2.6`

Record material findings and resolutions in this plan's `## Code Review` section using `docs/code-review.md`.
Do not ship while blocker findings remain open.

- [ ] **Step 8: Add post-execution report**

Append `## Post-Execution Report` to this plan with:

- implemented behavior
- tests run and observed results
- host limitations
- deviations from plan
- follow-up work

- [ ] **Step 9: Commit Task 7**

Run:

```bash
git add README.md plugins/opencode docs/specs/001-opencode-plugin.md docs/architecture/decisions.md docs/plans/001-opencode-plugin-parity.md
git commit -m "docs: document opencode plugin parity"
```

## Plan Self-Review

- Spec coverage: This plan covers plugin scaffold, marketplace metadata, runtime core, review, run, setup, status, result, cancel, gate, hooks, docs, tests, and `/tmp` avoidance.
- Host-surface realism: The plan verifies Codex command and agent support before claiming command or agent parity.
- Temp-file policy: The plan replaces `${TMPDIR:-/tmp}/opencode-prompts` with `.codex-buddy/opencode/tmp/` and tests that plugin-controlled prompt/task files stay project-local.
- Testing: Each implementation task ports or adds focused `node:test` coverage before committing.
- Naming conflicts: The plugin uses `opencode` for the Codex plugin name and `.codex-buddy/opencode/` for project state, avoiding the source plugin's `.claudecode-buddy` and `.claude-plugin` names.
- Stale references: Plan audits reject `deeps[e]ek/`, `volcengine-pla[n]/`, `kimi-k2.[5]`, `.claudecode-buddy`, `.claude-plugin`, and source `/tmp/opencode-prompts` runtime references in shipped plugin files.
- Blast radius: The implementation is scoped to new plugin files, test harness files, and numbered docs; it does not change global Codex configuration or source `claudecode-buddy` files.
- Edge cases: The plan covers missing source files, unverified Codex host surfaces, path traversal for prompt and task files, stale transient directory pruning, background job durability, and live CLI smoke tests gated by explicit user confirmation.

## Plan Review

Plan review must use the gate in `docs/development-workflow.md` before implementation starts:

- Codex self-review
- `opencode-go/deepseek-v4-pro`
- `opencode-go/glm-5.1`
- `opencode-go/kimi-k2.6`

Record reviewer findings and resolutions below before beginning Task 1.

### Round 1

- Codex self-review: `needs-attention`
  - Fixed non-existent `git[.]test.mjs` copy reference.
  - Added missing `tests/opencode/helpers.mjs`.
  - Corrected live e2e env var to `OPENCODE_E2E=1`.
  - Fixed nested Markdown fences for generated README and skill content.
- DeepSeek planning review (`opencode-go/deepseek-v4-pro`): `needs-attention`
  - Blocker: empty Plan Review section. Resolution: record Round 1 findings here and re-dispatch after revisions.
  - Blocker: hook event conventions were not verified before Task 6. Resolution: Task 1 now verifies hook and skill surfaces; Task 6 has a conservative no-active-hooks output if host events remain unverified.
  - Incorrect command: scaffold JSON validation used `require` under an ESM package. Resolution: Task 2 now uses `node --input-type=module` with `import fs`.
  - Source paths assumed. Resolution: Tasks 1, 3, 4, 5, and 6 now include source file preflight checks.
- GLM planning review (`opencode-go/glm-5.1`): `needs-attention`
  - Blocker: temp-path transformation was underspecified. Resolution: Task 3 now names concrete functions, call sites, error-message replacements, and affected tests.
  - Blocker: hook adaptation was vague and omitted session hook files. Resolution: Task 6 now copies session hook helpers and defines the conservative `hooks: {}` fallback.
  - Missing test: `prompt-cmd.test.mjs` was not copied. Resolution: Task 3 now copies and runs it.
  - Missing architecture decision/backlog check. Resolution: Task 7 now checks `docs/architecture/decisions.md` and backlog files.
- Kimi planning review (`opencode-go/kimi-k2.6`): `needs-attention`
  - Missing code review phase. Resolution: Task 7 now includes the code review gate and `## Code Review` recording requirement.
  - Missing reviewed-plan commit before implementation. Resolution: this revised plan will be committed after reviewer approval and before Task 1 begins.
  - Brittle test glob. Resolution: `package.json` now uses `node --test tests/opencode`.
  - Vague `.gitignore` update. Resolution: Task 2 now includes concrete `grep -qxF` append commands.

### Round 2

- DeepSeek planning review (`opencode-go/deepseek-v4-pro`): `needs-attention`
  - Prior blockers were resolved.
  - New blocker: tests require `tests/opencode/fixtures/*.mjs`, but the plan did not copy fixtures. Resolution: Task 3 now preflights and copies the fixtures directory.
  - Concern: `CLAUDE_PROJECT_DIR` remained implicit in `buddy.mjs`. Resolution: Task 3 now replaces copied runtime/tests with `CODEX_PROJECT_DIR` handling.
  - Concern: `stop-review-gate-hook.mjs` had `.claudecode-buddy/` and `CLAUDE_PROJECT_DIR` references after Task 3's replacement pass. Resolution: Task 6 now explicitly replaces those hook references and verifies no matches remain.
- GLM planning review (`opencode-go/glm-5.1`): `needs-attention`
  - Prior blockers were resolved.
  - New blocker: Task 3 referenced `run-cmd.test.mjs` before Task 5 copied it. Resolution: Task 3 now updates only `prompt-cmd.test.mjs`; Task 5 now updates `run-cmd.test.mjs` after copying it.
- Kimi planning review (`opencode-go/kimi-k2.6`): `needs-attention`
  - Prior blockers were mostly resolved.
  - Remaining blocker: no explicit reviewed-plan commit step. Resolution: added `## Pre-Implementation Gate` with an explicit reviewed-plan commit step.
  - Remaining blocker: same `run-cmd.test.mjs` sequencing issue reported by GLM. Resolution: moved the update instruction to Task 5.

### Round 3

- DeepSeek planning review (`opencode-go/deepseek-v4-pro`): `approve`
  - Verified fixture copy, `CODEX_PROJECT_DIR` replacement instructions, and stop hook stale-reference cleanup.
  - No new blockers found.
- GLM planning review (`opencode-go/glm-5.1`): `approve`
  - Verified `run-cmd.test.mjs` updates moved to Task 5 after the file is copied.
  - No new blockers found.
- Kimi planning review (`opencode-go/kimi-k2.6`): `approve`
  - Verified reviewed-plan commit gate and `run-cmd.test.mjs` sequencing.
  - No new blockers found.

## Code Review

Implementation code review findings will be recorded here after Task 7 verification and before shipping.
