# opencode

Codex plugin for running opencode review, investigation, and delegated CLI workflows.

The shared runtime is `scripts/buddy.mjs`.
Durable plugin state lives under `.codex-buddy/opencode/`.
Transient prompt and task files live under `.codex-buddy/opencode/tmp/` and are pruned by the runtime.

Use Codex command files, agent files, bundled skill instructions, or direct runtime commands:

```bash
node plugins/opencode/scripts/buddy.mjs setup
node plugins/opencode/scripts/buddy.mjs review --scope branch --model opencode-go/deepseek-v4-flash
node plugins/opencode/scripts/buddy.mjs run --task "Inspect the current branch" --model opencode-go/glm-5.1 --background
```
