# Development Workflow

Follow this process for every substantial plan.
Do not skip steps or batch them.

For trivial changes, use judgement.
Any multi-file feature, refactor, plugin change, workflow change, or integration must follow this workflow.

---

## Step 1 — Design

Explore the problem space before committing to an approach.

1. Clarify the user's intent: what problem are we solving, and what does success look like?
2. Research constraints: read `docs/architecture/decisions.md` if it exists, check relevant code, and identify affected systems.
3. Brainstorm approaches, compare trade-offs, and identify risks.
4. Get user alignment on the approach before writing a plan.

**Output:** one of the following, depending on complexity:

- **Verbal alignment** for simple, well-defined tasks.
- **Straight to plan** when the design is concrete and there are no durable architectural decisions to record.
- **Design spec** in `docs/specs/` when the work introduces or refines an architectural decision or resolves cross-cutting ambiguity.

Rule of thumb:

- Architectural decision or cross-cutting ambiguity: write or update a spec.
- Execution-level detail: write a plan.
- Both: amend the spec, then write the plan referencing it.

`docs/architecture/decisions.md` is the index of cross-cutting decisions.
The fuller design context for each decision lives in the relevant spec or plan.

Skip this step only when the task is well-defined with an obvious approach.

## Step 2 — Plan

Write a concrete execution plan with phases, files, tests, and verification steps.

1. Read `docs/architecture/decisions.md` if it exists.
2. Read existing plans in `docs/plans/` for reusable patterns and conventions.
3. Read the project backlog file if one exists for relevant outstanding work.
4. Write a detailed plan with phases, file lists, testing or verification per phase, and final verification steps.
5. Self-review the plan for inconsistencies, missing files, stale references, blast radius, naming conflicts, and edge cases.
6. Save the plan to `docs/plans/` with the next sequential number.
7. Dispatch the Phase 0 plan-review gate.
8. If the reviewer flags blockers, revise the plan and re-dispatch review on the revised plan.
9. Get user approval on the reviewed plan.
10. Commit the reviewed plan file before implementation.

Phase 0 external plan review uses raw `opencode run` until the Codex `opencode` plugin exists:

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

Record material reviewer output and resolutions in the plan file.
Do not invent external Codex reviewer commands during Phase 0.
Use current-session Codex self-review plus the raw `opencode` plan reviewer.

## Step 3 — Build

Implement the plan phase by phase.
Do not batch phases.

For each phase:

1. **Implement** the code or documentation for this phase only.
2. **Test** or verify the phase exactly as the plan specifies.
3. **Self-review** the modified files against the plan and `docs/architecture/decisions.md`.
4. **Document** behavior changes in the relevant docs and README files.
5. **Commit** only after verification and self-review are clean.

When tasks are independent and the user explicitly asks for parallel agent work, split them across agents with disjoint write scopes.
Otherwise, execute tasks in order in the current session.

When a test fails or behavior is unexpected, debug systematically: reproduce, isolate, form a hypothesis, and verify one change at a time.

## Step 4 — Verify

After all phases are complete, verify the whole before review.

1. Run the full relevant test suite or documentation verification commands.
2. Check cross-phase consistency: duplicated logic, inconsistent patterns, stale docs, and missed edge cases.
3. Compare actual coverage against the plan's verification strategy.
4. Fix any issues using the Build step's phase discipline.

Before claiming work is done, run verification commands and confirm the actual output.

## Step 5 — Review

Code review happens after implementation is complete and verification has passed.
During Phase 0, use three review inputs:

1. Current-session Codex self-review.
2. Raw `opencode run` pinned to `deepseek/deepseek-v4-flash`.
3. Raw `opencode run` pinned to `volcengine-plan/glm-5.1`.

Use these raw reviewer commands until the Codex `opencode` plugin exists:

```bash
/home/chris/.opencode/bin/opencode run --model deepseek/deepseek-v4-flash --format default --print-logs --log-level INFO --dangerously-skip-permissions "Code review the changes on this branch in \"$(pwd)\". Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
/home/chris/.opencode/bin/opencode run --model volcengine-plan/glm-5.1 --format default --print-logs --log-level INFO --dangerously-skip-permissions "Code review the changes on this branch in \"$(pwd)\". Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
```

Each material finding is recorded in the plan file's `## Code Review` section using the format in `docs/code-review.md`.
All open blocker findings must be resolved before shipping.

When acting on review feedback, evaluate each finding rigorously before implementing it.
If a finding is ambiguous or technically questionable, document the reasoning instead of applying it blindly.

## Step 6 — Ship

Wrap up the branch.

1. Update the plan file with a post-execution report: implementation details, deviations from plan, verification results, known limitations, and follow-up work.
2. Update `docs/architecture/decisions.md` if new lasting decisions were made.
3. Update the project backlog file if one exists.
4. Commit the updated plan and docs.
5. Run final verification.
6. Push or create a PR only when the user asks for that step.

## Session Handoff Rules

Multiple sessions may share the same local repository sequentially.
Prevent lost work with these rules:

1. Commit all intentional file changes before ending a development session.
2. Push only when the user asks.
3. Check `git status` on session start.
4. Treat uncommitted changes as user or previous-session work unless you know you created them.
5. Verify prior work by checking `git log`, reading plan files, and confirming post-execution reports exist.
