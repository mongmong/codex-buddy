# Spec — opencode Codex Plugin

This is the cross-cutting design baseline for the Codex-native `opencode` plugin.
Concrete file lists, tests, and implementation phases belong in execution plans under `docs/plans/`.

## Why This Plugin Exists

This plugin gives Codex an ergonomic wrapper around the opencode CLI.
It is the Codex-side counterpart to `../claudecode-buddy/plugins/opencode`.

The source workspace uses opencode as an external review and delegation engine.
Codex Buddy needs the same practical capability, adapted to Codex plugin layout and Codex host constraints.

## Goals

- Preserve practical feature parity with the Claude Code `opencode` plugin.
- Use Codex-native plugin layout and marketplace metadata.
- Keep opencode model selection delegated to the user's opencode config.
- Avoid routine `/tmp` writes by using project-local `.codex-buddy/opencode/tmp/` transient storage.
- Provide review output that is useful to humans and machine-readable review gates.
- Preserve a low-dependency runtime until a plan justifies adding dependencies.

## Non-Goals

- Do not implement `/claudecode:*` commands in this plugin.
- Do not wrap opencode TUI mode.
- Do not add external runtime dependencies without a plan.
- Do not silently drop source-plugin capabilities when Codex host support is not verified.

## Architecture

The plugin root is `plugins/opencode/`.
The manifest is `plugins/opencode/.codex-plugin/plugin.json`.
Repo marketplace metadata lives at `.agents/plugins/marketplace.json`.

The companion runtime is a Node ESM script at `plugins/opencode/scripts/buddy.mjs`.
Thin Codex-native surfaces call this runtime rather than duplicating opencode invocation, prompt construction, state handling, output parsing, or validation logic.

The expected plugin layout is:

```text
plugins/opencode/
├── .codex-plugin/plugin.json
├── skills/
├── hooks.json
├── scripts/
│   ├── buddy.mjs
│   └── lib/
├── schemas/
├── assets/
├── README.md
└── CHANGELOG.md
```

`docs/specs/000-codex-plugin-surface-research.md` is authoritative for the Codex plugin surfaces verified during Phase 0.
Commands and agents are not locally verified yet.
The Phase 1 plugin plan must verify the Codex-native command and agent surfaces before implementing command parity.

## Runtime State

Durable state lives under `.codex-buddy/opencode/` at the project root.
Transient plugin-controlled files live under `.codex-buddy/opencode/tmp/`.

Background jobs, if implemented, store durable job metadata and output under `.codex-buddy/opencode/jobs/`.
Prompt files and task payloads are transient and must not be mixed with durable job output.

## Temporary File Policy

The Claude source plugin uses `${TMPDIR:-/tmp}/opencode-prompts`.
The Codex port must not copy that pattern.

Plugin-controlled prompt and task files must be created under `.codex-buddy/opencode/tmp/`.
Each invocation should use a per-run subdirectory.
Foreground invocations clean their transient directory before returning.
Background invocations keep durable artifacts under `.codex-buddy/opencode/jobs/` and clean transient prompt directories once the child process has consumed them.

The runtime must include stale transient-directory pruning so interrupted sessions do not accumulate unbounded project-local temp data.

## Review Output

Review output uses Markdown findings followed by a minimal fenced JSON trailer:

```json
{
  "verdict": "approve",
  "blockers": []
}
```

The trailer schema stays intentionally small.
`verdict` is either `approve` or `needs-attention`.
`blockers` is an array of human-readable blocker summaries.

Rich findings stay in Markdown.
The JSON trailer exists only to give review gates a deterministic branch signal.

Runtime validation uses small handwritten validators until a plan justifies adding schema dependencies.

## Capability Parity Matrix

| Capability | Source Plugin Surface | Codex Status | Notes |
|---|---|---|---|
| Review | `/opencode:review`, review subagent | planned with documented host limitation | Command and agent surfaces require Phase 1 Codex host verification. |
| Run | `/opencode:run`, run subagent | planned with documented host limitation | Write-capable delegation depends on verified Codex command or agent surfaces. |
| Setup | `/opencode:setup` | planned with documented host limitation | Diagnostics are planned after command surface verification. |
| Status | `/opencode:status` | planned with documented host limitation | Requires background job state. |
| Result | `/opencode:result` | planned with documented host limitation | Requires background job state. |
| Cancel | `/opencode:cancel` | planned with documented host limitation | Requires process tracking and background job state. |
| Gate | end-of-session review gate | planned with documented host limitation | Hook feasibility must be verified against Codex hook support. |
| Model selection | opencode config delegation | planned | Keep model selection delegated to opencode config. |
| Variants | focused review prompts | planned | Prompt variants should be thin wrappers around the shared runtime. |
| Adversarial style | challenge-oriented review | planned | Implement as a prompt style, not as a separate runtime path. |
| Background jobs | job metadata and output files | planned | Use `.codex-buddy/opencode/jobs/` for durable state. |
| Sessions | orphan detection and lifecycle notes | planned with documented host limitation | Depends on verified hook behavior. |
| Hooks | hook config | planned with documented host limitation | `hooks.json` exists in installed plugin examples, but specific events need implementation-time verification. |
| Trailer parsing | Markdown plus JSON trailer | planned | Use handwritten validation first. |
| Temp handling | project-local transient storage | planned | Use `.codex-buddy/opencode/tmp/`, never routine system temp files. |

## Future Work

`/claudecode:*` support is deferred to a future plan.
That support should wrap or forward to the source workspace only after the Codex-native `opencode` plugin exists and has its own review and run surfaces.
