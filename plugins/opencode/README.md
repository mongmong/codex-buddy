# opencode

Codex plugin for running opencode review, investigation, delegated run, and job-management workflows.

The shared runtime is `scripts/buddy.mjs`. Command files, agent files, and the bundled skill all forward to that runtime instead of duplicating CLI behavior.

## Setup

Run diagnostics from the repository root:

```bash
node plugins/opencode/scripts/buddy.mjs setup
```

List configured opencode models:

```bash
node plugins/opencode/scripts/buddy.mjs models
```

Model selection stays delegated to the user's opencode configuration. Use `--model <model-name>` only when a workflow needs an explicit configured model.

## Review

Review the current branch:

```bash
node plugins/opencode/scripts/buddy.mjs review --scope branch
```

Review the working tree with an explicit model:

```bash
node plugins/opencode/scripts/buddy.mjs review --scope working-tree --model <model-name>
```

Forward a prepared prompt through a project-local prompt file:

```bash
node plugins/opencode/scripts/buddy.mjs prompt --prompt-file .codex-buddy/opencode/tmp/run-example/prompt.txt
```

## Run

Run a foreground delegated task:

```bash
node plugins/opencode/scripts/buddy.mjs run --task "Refactor the selected module" --model <model-name> --yolo
```

Run in the background:

```bash
node plugins/opencode/scripts/buddy.mjs run --task "Implement the planned change" --model <model-name> --yolo --background
```

Use `--task-file <path>` only for files under `.codex-buddy/opencode/tmp/`.

## Jobs

Inspect jobs:

```bash
node plugins/opencode/scripts/buddy.mjs status
node plugins/opencode/scripts/buddy.mjs status <job-id>
```

Read a finished job result:

```bash
node plugins/opencode/scripts/buddy.mjs result <job-id>
```

Cancel an in-flight background job:

```bash
node plugins/opencode/scripts/buddy.mjs cancel <job-id>
```

## Gate

Toggle the workspace-level review-gate setting:

```bash
node plugins/opencode/scripts/buddy.mjs gate status
node plugins/opencode/scripts/buddy.mjs gate on
node plugins/opencode/scripts/buddy.mjs gate off
```

The gate helper is implemented and tested, but `hooks.json` keeps automatic lifecycle hook installation disabled until Codex lifecycle event names are verified. The helper fails open on review-system errors and skips clean working trees.

## State Layout

Durable state lives under `.codex-buddy/opencode/`:

- `.codex-buddy/opencode/config.json`: workspace runtime settings
- `.codex-buddy/opencode/jobs/`: background job records, stdout, stderr, and event logs
- `.codex-buddy/opencode/sessions/`: opencode session continuity records
- `.codex-buddy/opencode/tmp/`: transient prompt and task files

Plugin-controlled prompt and task files must stay under `.codex-buddy/opencode/tmp/`. The runtime prunes stale transient directories and does not use routine system temp storage for prompt forwarding.

## Host Limitations

Codex plugin examples verify command, agent, skill, and `hooks.json` surfaces. The local examples only verify a `PostToolUse` hook event, so automatic parity for source lifecycle events such as `SessionStart`, `SessionEnd`, and `Stop` remains disabled. The runtime hook helpers remain available for direct tests and future host integration.
