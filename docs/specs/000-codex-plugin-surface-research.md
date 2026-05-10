# Codex Plugin Surface Research

## Purpose

This note records the Codex plugin surfaces verified before porting the Claude Code `opencode` plugin.
It exists so `docs/specs/001-opencode-plugin.md` can distinguish implemented parity from host limitations.

## Verified Sources

- `/home/chris/.codex/skills/.system/plugin-creator/SKILL.md`
- `/home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`
- `/home/chris/.codex/.tmp/plugins/.agents/plugins/marketplace.json`
- Installed plugin manifests such as `/home/chris/.codex/.tmp/plugins/plugins/linear/.codex-plugin/plugin.json` and `/home/chris/.codex/.tmp/plugins/plugins/codex-security/.codex-plugin/plugin.json`
- Installed plugin directory examples under `/home/chris/.codex/.tmp/plugins/plugins/`
- `/home/chris/.codex/.tmp/plugins/README.md`
- Command examples such as `/home/chris/.codex/.tmp/plugins/plugins/vercel/commands/status.md`
- Agent examples such as `/home/chris/.codex/.tmp/plugins/plugins/vercel/agents/ai-architect.md`
- Hook examples such as `/home/chris/.codex/.tmp/plugins/plugins/figma/hooks.json`

## Confirmed Surfaces

### Manifest

Codex plugins use `plugins/plugin-name/.codex-plugin/plugin.json`.
The manifest `name` matches the normalized plugin folder name.
The manifest supports top-level metadata such as `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `skills`, `hooks`, `mcpServers`, `apps`, and `interface`.

The `interface` block carries presentation and discovery metadata, including `displayName`, `shortDescription`, `longDescription`, `developerName`, `category`, `capabilities`, URLs, starter prompts, brand color, icons, logo, and screenshots.

### Marketplace

Repo-local marketplaces use `.agents/plugins/marketplace.json`.
Entries use local paths such as `./plugins/plugin-name` and include `policy.installation`, `policy.authentication`, and `category`.

The verified marketplace root supports top-level `name`, optional `interface.displayName`, and an ordered `plugins` array.
Plugin order in the array is treated as render order.

### Optional Plugin Folders

Codex plugin scaffolding supports optional `skills/`, `agents/`, `commands/`, `hooks/`, `scripts/`, `assets/`, `.mcp.json`, and `.app.json`.
Installed examples confirm common use of `skills/`, nested skill directories containing `SKILL.md`, `agents/`, `commands/`, `assets/`, `.app.json`, `.mcp.json`, `hooks.json`, and `scripts/`.

### Commands, Agents, And Hooks

Installed plugin examples verify plugin-level `commands/` and `agents/` directories.
Command files are Markdown files with frontmatter, for example `/home/chris/.codex/.tmp/plugins/plugins/vercel/commands/status.md`.
Agent files are Markdown files with frontmatter, for example `/home/chris/.codex/.tmp/plugins/plugins/vercel/agents/ai-architect.md`.
Some plugin examples also include `agents/openai.yaml`, so agent metadata can include YAML alongside Markdown agent definitions.

The local plugin creator references verify a `hooks` manifest field and generated hook configuration path support.
Installed examples include plugin-root `hooks.json`.
The observed Figma hook example uses `PostToolUse` with a `matcher` and command hook entries.
The local examples do not verify Claude Code lifecycle event names such as `SessionStart`, `SessionEnd`, or `Stop` for Codex plugins.

This means command and agent parity can be implemented with Codex plugin files, while automatic lifecycle review gates must remain planned with documented host limitation until Codex lifecycle hook events are verified.

### Skills

The plugin manifest supports `"skills": "./skills/"`.
Installed examples verify nested skill directories such as `skills/<skill-name>/SKILL.md`.
The `opencode` plugin should use `plugins/opencode/skills/opencode-cli-runtime/SKILL.md`.

## Host Limitations

Any source plugin feature that depends on an unavailable or unverified Codex host surface must be marked as "planned with documented host limitation" in `docs/specs/001-opencode-plugin.md`.
