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

Phase 0 must not copy the source repo blindly.
It must preserve the workflow shape while making the resulting documents true for this Codex repo.

The mirror should preserve the six-step process:

1. Design
2. Plan
3. Build
4. Verify
5. Review
6. Ship

The mirror should also preserve the review-gate intent.
Where the Claude repo currently uses Claude-specific plugin surfaces, this repo must document either a Codex-native equivalent or an explicit bootstrapping fallback.
The fallback rules below are mandatory for Phase 0 and plan 000.

The workflow docs should remain close to the source text.
The goal is not to redesign the process.
The goal is to make this repo follow the same process before major development begins.

### Phase 0 Bootstrapping Review Rules

The Codex `opencode` plugin does not exist at the start of Phase 0.
Until it exists, the workflow must use these live review paths:

- **Self-review:** the current Codex coding session performs the self-review step.
  Do not import the Claude repo's Sonnet/Opus tier policy.
  In this repo, the default coding and self-review agent is the current Codex model unless the user explicitly changes it.
- **Plan review:** use raw `opencode run --model deepseek/deepseek-v4-pro` from the repo root as the external plan reviewer.
  Record the reviewer output in the plan file.
- **Code review:** use raw `opencode run` from the repo root for the two opencode reviewers that the Claude workflow names:
  `deepseek/deepseek-v4-flash` and `volcengine-plan/glm-5.1`.
  Record both outputs in the plan file.
- **Codex reviewer references:** do not invent a `codex:codex-rescue` equivalent for this repo during Phase 0.
  Where the source workflow mentions `codex:codex-rescue` or `/codex:review`, translate that role to "Codex self-review/current-session review" unless a later Codex plugin surface provides a real external Codex reviewer.
- **After the Codex `opencode` plugin ships:** replace the raw opencode CLI fallback with the plugin's Codex-native commands or programmatic surfaces.

These rules make the review gates live during bootstrapping instead of target-only prose.
They also avoid a circular dependency where plan 000 requires the plugin that plan 000 has not built yet.

### Architecture Decision Mirror Scope

`docs/architecture/decisions.md` must start as a fresh Codex decision log.
It should not be a verbatim copy of `../claudecode-buddy/docs/architecture/decisions.md`.

Phase 0 should port only decisions that are already true or intentionally adopted for this repo:

- Codex plugin layout uses `plugins/<name>/.codex-plugin/plugin.json`.
- The marketplace manifest lives at `.agents/plugins/marketplace.json`.
- Each plugin uses one Node ESM companion at `scripts/buddy.mjs` plus focused modules under `scripts/lib/`.
- Runtime validation uses small handwritten validators until a plan justifies adding dependencies.
- Review output uses Markdown findings plus a minimal fenced JSON trailer.
- Runtime state lives under `<project>/.codex-buddy/<plugin-name>/`.
- Transient prompt and task files live under `<project>/.codex-buddy/<plugin-name>/tmp/`, not `/tmp` or `${TMPDIR}` by default.
- The initial product target is parity with the Claude Code `opencode` plugin, with Codex-specific differences documented.
- Bootstrapping reviews use raw `opencode run` until the Codex `opencode` plugin exists.

Claude-only decisions must not be copied as active Codex decisions.
Examples include `.claude-plugin` marketplace distribution, `~/.claude/` install paths, Claude hook semantics, `CLAUDE.md` as the source instruction file, and Claude model-tier policy.

When an adopted Codex decision is derived from a Claude-side decision, the Codex decision may cite the source decision ID as provenance.
The Codex decision text must still state the Codex-specific rule directly.

### `opencode` Spec Mirror Scope

`docs/specs/opencode-plugin.md` must be a Codex-native rewrite using `../claudecode-buddy/docs/specs/opencode-plugin.md` as source material.
It must not be a syntactic substitution pass.

The Codex spec must preserve the source plugin's architectural intent:

- thin user-facing commands
- programmatic review/run surfaces
- one Node companion script as the opencode boundary
- shared prompt, invoke, trailer, scope, session, config, and job helpers
- hybrid Markdown plus JSON trailer output
- foreground and background task support
- session continuity
- opt-in review gate where host hooks support it

The Codex spec must translate or remove host-specific details:

- Replace `.claude-plugin/plugin.json` with `.codex-plugin/plugin.json`.
- Replace `.claudecode-buddy/` with `.codex-buddy/`.
- Replace `.claude-plugin/marketplace.json` with `.agents/plugins/marketplace.json`.
- Replace `CLAUDE.md` references with `AGENTS.md`.
- Replace Claude slash-command frontmatter and `CLAUDE_PLUGIN_ROOT` assumptions with Codex plugin command conventions after those conventions are verified locally.
- Replace Claude subagent and skill invocation examples with Codex-native plugin surfaces after those surfaces are verified locally.
- Replace the source plugin's `${TMPDIR:-/tmp}/opencode-prompts` prompt-file pattern with a project-local transient directory under `<project>/.codex-buddy/opencode/tmp/`.
  The Codex port must not create routine prompt or task files under `/tmp`, because long-running review and run workflows can fill the system temp filesystem.

The Phase 0 plan must include a short Codex plugin-surface research step before finalizing the rewritten `docs/specs/opencode-plugin.md`.
The research output should state which Codex plugin surfaces are available for commands, agents or skills, hooks, and marketplace metadata.
If a surface is unavailable or unclear, the spec must mark the affected parity feature as "planned with documented host limitation" rather than pretending parity exists.

### Temporary File Policy

The Claude source plugin currently writes forwarded prompt and task bodies under `${TMPDIR:-/tmp}/opencode-prompts`.
That pattern must not be copied into the Codex port.

The Codex port should use:

```text
<project>/.codex-buddy/opencode/tmp/
```

for transient prompt files, task files, raw event capture scratch files, and any equivalent temporary artifacts that are controlled by this plugin.

The implementation plan must include cleanup behavior:

- Remove per-invocation prompt and task directories after foreground calls finish.
- For background jobs, store durable job artifacts under the job state directory, not the transient temp directory.
- Prune stale transient directories on startup or before new dispatches.
- Keep `.codex-buddy/` gitignored.
- Use `/tmp` only for test fixtures or unavoidable host-tool requirements, and clean those fixtures in `finally` blocks.

This is a deliberate Codex-side divergence from the Claude source plugin.
It preserves the safety property of avoiding shell interpolation while avoiding unbounded `/tmp` growth.

### Phase 0 Test Harness Scope

Phase 0 should not add a full plugin runtime test harness.
It should verify documentation and repository structure only.

If Phase 0 adds executable validation, it should be limited to low-risk checks such as:

- Markdown files exist at expected paths.
- `.gitignore` includes `.codex-buddy/` if that directory convention is introduced.
- Marketplace or plugin manifests are valid JSON if Phase 0 creates them.

The Node `node:test` harness from the Claude repo should be introduced during the first plugin implementation plan, not during workflow adoption, unless Phase 0 creates executable JavaScript.

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

For parity purposes, "preserve" means the feature is either implemented with equivalent user-visible behavior or explicitly documented as blocked by a Codex host limitation.
The plan cannot silently omit a listed capability.

The Codex port must preserve the source plugin's important behavior:

- explicit model selection or `--model` pinning
- provider-specific `--variant`
- friendly and adversarial review styles
- foreground and background runs
- background job state
- session continuity
- setup diagnostics
- structured review trailer parsing
- stop-review gate configuration and behavior where hooks are available
- project-local temporary file handling that avoids routine `/tmp` writes

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

Phase 0 is complete when this repo has:

- mirrored development workflow docs with explicit bootstrapping review rules
- a mirrored code-review process that names live Codex-side review paths
- a fresh Codex architecture decision index with only adopted Codex decisions
- a Codex-native `opencode` spec baseline derived from the Claude plugin spec
- a documented Codex plugin-surface research result
- `AGENTS.md` pointing future work at the mirrored workflow
- `.codex-buddy/` gitignored if the state directory convention is introduced
- a documented temp-file policy that keeps plugin-controlled prompt and task files out of `/tmp`

The parity port is complete when the Codex `opencode` plugin exposes the same practical capabilities as the Claude Code `opencode` plugin, with documented Codex-specific differences only where the host platform requires them.

The `/claudecode:*` wrapper is not required for parity.
It is successful only when captured as explicit future work so it is not lost.
