# Codex Buddy Parity Design

## Purpose

This workspace will become the Codex-side counterpart to `../claudecode-buddy`.
The first product goal is feature parity with the Claude Code `opencode` plugin, implemented as a Codex-native plugin.

Before plugin development starts, this repo must first adopt the development workflow from `../claudecode-buddy`.
The workflow migration is Phase 0 and is a prerequisite for all plugin implementation work.

## Approved Scope

The implementation sequence is:

1. Mirror the development workflow from `../claudecode-buddy`.
2. Port the `opencode` plugin to Codex-native plugin conventions with parity as the target.
3. Defer a future Claude Code wrapper plugin or command namespace for `/claudecode:*` commands.

The first implementation plan must not start with plugin code.
It must first establish the workflow, review process, baseline architecture docs, and repo instructions that future plans will follow.

## Phase 0: Workflow Mirror

Phase 0 ports the process documents from `../claudecode-buddy` into this repo with only the substitutions needed for Codex:

- `docs/development-workflow.md`
- `docs/code-review.md`
- `docs/architecture/decisions.md`
- `docs/specs/opencode-plugin.md` as the starting product design reference
- `AGENTS.md` updates that point contributors at the mirrored workflow

The mirror should preserve the six-step process:

1. Design
2. Plan
3. Build
4. Verify
5. Review
6. Ship

The mirror should also preserve the review-gate intent.
Where the Claude repo currently uses Claude-specific plugin surfaces, this repo should document the Codex-native equivalent or a bootstrapping fallback.
Before the Codex `opencode` plugin exists, opencode-based review steps may need to run through the raw `opencode` CLI or be marked as unavailable until the plugin lands.

The workflow docs should remain close to the source text.
The goal is not to redesign the process.
The goal is to make this repo follow the same process before major development begins.

## Plugin Parity Target

After Phase 0, the Codex plugin work targets parity with `../claudecode-buddy/plugins/opencode`.

The plugin should keep the public product name and command namespace `opencode` unless a later plan records a reason to change it.
The expected Codex-native structure is:

```text
plugins/opencode/
├── .codex-plugin/plugin.json
├── commands/
├── agents/
├── skills/
├── hooks/
├── prompts/
├── schemas/
├── scripts/
│   ├── buddy.mjs
│   └── lib/
├── README.md
└── CHANGELOG.md
```

The repository marketplace manifest should live at `.agents/plugins/marketplace.json`.
Plugin entries should use local source paths such as `./plugins/opencode`.

The runtime should remain a Node ESM companion with no external runtime dependencies unless a later plan proves a dependency is necessary.
The companion script should stay at `plugins/opencode/scripts/buddy.mjs`, with helper modules under `plugins/opencode/scripts/lib/`.

The Codex port should preserve these user-facing capabilities where Codex plugin surfaces support them:

- `review`
- `run`
- `setup`
- `status`
- `result`
- `cancel`
- `gate`

The Codex port should preserve the source plugin's important behavior:

- explicit model selection or `--model` pinning
- provider-specific `--variant`
- friendly and adversarial review styles
- foreground and background runs
- background job state
- session continuity
- setup diagnostics
- structured review trailer parsing
- stop-review gate configuration and behavior where hooks are available

If Codex plugin hooks do not support the same lifecycle as Claude Code hooks, the hook limitation should be documented in the plan and README.
The command/config pieces should still be designed so hook support can be completed later without reworking the runtime shape.

Runtime state should use a Codex-specific directory instead of `.claudecode-buddy`.
The default should be:

```text
<project>/.codex-buddy/opencode/
```

That directory should be gitignored.

## Future Claude Code Wrapper

Support for calling Claude Code from Codex is a future plan, not part of the initial `opencode` parity port.

The future work should add a separate plugin or command namespace for commands such as:

- `/claudecode:review`
- `/claudecode:run`
- `/claudecode:status`
- `/claudecode:result`
- `/claudecode:cancel`

This should be designed after the `opencode` parity work establishes the Codex wrapper patterns.
The future plan should decide whether the Claude Code wrapper is a separate plugin or a second plugin in the same marketplace.

## Testing Strategy

Phase 0 should verify documentation and repo structure only.
It should not need runtime plugin tests unless it adds executable validation.

Plugin parity phases should port the Node test strategy from `../claudecode-buddy`:

- argument parsing tests
- model listing tests
- prompt and trailer parsing tests
- git scope tests
- job lifecycle tests
- session continuity tests
- hook behavior tests where supported
- smoke tests for command wrappers where a harness exists

End-to-end tests against a real `opencode` CLI should remain opt-in through an environment variable.

## Success Criteria

Phase 0 is complete when this repo has a mirrored development workflow, review process, architecture decision index, Codex-adapted `opencode` spec baseline, and `AGENTS.md` points future work at that workflow.

The parity port is complete when the Codex `opencode` plugin exposes the same practical capabilities as the Claude Code `opencode` plugin, with documented Codex-specific differences only where the host platform requires them.

The `/claudecode:*` wrapper is not required for parity.
It is successful only when captured as explicit future work so it is not lost.
