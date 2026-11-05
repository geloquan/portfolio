# Blockers

## ESLint configuration

- **Affected check:** `npm run lint` (Phase 5 verification).
- **Observed limitation:** the installed ESLint 9 rejects the repository's current configuration because `plugins` is an array of strings rather than a flat-config object. No lint result can be claimed until the config is migrated or a compatible ESLint version is deliberately restored.
- **Options:** migrate the repository ESLint configuration to ESLint 9 flat config, or pin a compatible ESLint major and its matching configuration format.
- **Recommendation:** handle as a separate, repository-wide tooling change; do not broaden this portfolio implementation by silently migrating lint configuration. Run lint again and report the exact failure.
