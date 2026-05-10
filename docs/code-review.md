# Code Review Process

Code review happens after implementation is complete.
It is distinct from the plan review gate.

The plan file's `## Code Review` section is the communication channel between reviewers and authors.
Reviewers add findings there, and authors respond inline.

Until the Codex `opencode` plugin exists, this workspace uses:

1. Codex current-session self-review.
2. Raw opencode review on `deepseek/deepseek-v4-flash`.
3. Raw opencode review on `volcengine-plan/glm-5.1`.

After the Codex `opencode` plugin ships, replace the raw opencode commands with the plugin's Codex-native review surface.

## Reviewer Commands

Use the two raw opencode commands shown below until the Codex `opencode` plugin exists.

```bash
REPO_ROOT="$(pwd)"
/home/chris/.opencode/bin/opencode run \
  --model deepseek/deepseek-v4-flash \
  --format default \
  --print-logs --log-level INFO \
  --dangerously-skip-permissions \
  "Code review the changes on this branch in ${REPO_ROOT}. Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
```

```bash
REPO_ROOT="$(pwd)"
/home/chris/.opencode/bin/opencode run \
  --model volcengine-plan/glm-5.1 \
  --format default \
  --print-logs --log-level INFO \
  --dangerously-skip-permissions \
  "Code review the changes on this branch in ${REPO_ROOT}. Run git diff main...HEAD if available, otherwise inspect the working tree. Focus on correctness, security, consistency with AGENTS.md and docs/architecture/decisions.md. Do not modify files. Return findings with file:line references and verdict approve or needs-attention."
```

## For Reviewers

Append a review round to the relevant plan file's `## Code Review` section.
Use this format:

```markdown
### Review N - [codex] | [opencode:deepseek-v4-flash] | [opencode:glm-5.1]

- **Date**: YYYY-MM-DD
- **Reviewer**: Codex current session / opencode model / human name
- **Verdict**: Approved / Approved with suggestions / Changes requested

**Must Fix / Should Fix / Nice to Have**

1. `[OPEN]` Finding description with file:line references.
2. `[OPEN]` Another finding.
```

Each finding gets a numbered item with `[OPEN]` status.
Prioritize as Must Fix, Should Fix, or Nice to Have.
Include file paths and line numbers.
End with a short summary.

If no plan file corresponds to the reviewed branch, create a stub review entry in the nearest matching plan file or note the absence explicitly.

## For Authors

After addressing review findings, respond inline under each item:

```markdown
1. `[FIXED]` Finding description.
   Response: What was done, commit ref.

2. `[WONTFIX]` Finding description.
   Response: Why this is deferred or by design.
```

Status values:

- `[OPEN]`: unaddressed.
- `[FIXED]`: resolved.
- `[WONTFIX]`: intentionally not fixed, with reason.

All `[OPEN]` items from any reviewer must be resolved before shipping.
