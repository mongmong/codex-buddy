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

For review gates, choose one or more externally configured review-capable models:

```bash
node plugins/opencode/scripts/buddy.mjs review --scope branch --model <model-name>
```

For investigations, use read-only prompts and a model selected from current project configuration or `node plugins/opencode/scripts/buddy.mjs models`.
