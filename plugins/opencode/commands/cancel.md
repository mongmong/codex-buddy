---
description: Cancel an in-flight opencode background job
argument-hint: '<job-id>'
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

!`node plugins/opencode/scripts/buddy.mjs cancel "$ARGUMENTS"`

Surface the companion's output verbatim. SIGTERM is sent first; SIGKILL escalation grace is 2 seconds.
