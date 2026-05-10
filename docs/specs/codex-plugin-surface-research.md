# Codex Plugin Surface Research

## Purpose

This note records the Codex plugin surfaces verified before porting the Claude Code `opencode` plugin.
It exists so `docs/specs/opencode-plugin.md` can distinguish implemented parity from host limitations.

## Verified Sources

- `/home/chris/.codex/skills/.system/plugin-creator/SKILL.md`
- `/home/chris/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`
- `/home/chris/.codex/.tmp/plugins/.agents/plugins/marketplace.json`
- Installed plugin manifests such as `/home/chris/.codex/.tmp/plugins/plugins/linear/.codex-plugin/plugin.json` and `/home/chris/.codex/.tmp/plugins/plugins/codex-security/.codex-plugin/plugin.json`
- Installed plugin directory examples under `/home/chris/.codex/.tmp/plugins/plugins/`

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

Codex plugin scaffolding supports optional `skills/`, `hooks/`, `scripts/`, `assets/`, `.mcp.json`, and `.app.json`.
Installed examples confirm common use of `skills/`, `assets/`, `.app.json`, `.mcp.json`, `hooks.json`, and `scripts/`.

### Commands, Agents, And Hooks

The local plugin creator references verify a `hooks` manifest field and generated hook configuration path support.
Installed examples include `hooks.json`, which confirms hook configuration files are present in real plugins.

The local references do not verify a command manifest convention or an agent manifest convention for Codex plugins.
The Phase 1 plugin plan must verify the Codex-native command and agent surfaces before implementing command parity with the Claude Code plugin.
Until that verification happens, command and agent parity rows in `docs/specs/opencode-plugin.md` must be marked as planned with documented host limitation.

## Host Limitations

Any source plugin feature that depends on an unavailable or unverified Codex host surface must be marked as "planned with documented host limitation" in `docs/specs/opencode-plugin.md`.
