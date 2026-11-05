# Skill gaps and conflicts

## Phase 0–1

- **Visual-storytelling guidance incomplete:** the repository skill's `SKILL.md` is empty and its referenced `storytelling-patterns.md` is absent. Used the available narrative-techniques reference to shape the context → question → evidence → resolution outline; no extra animation or component rules were inferred.
- **Anti-slop skill files unavailable to loader:** attempts to activate `antislop`, `antislop-ui`, `antislop-code`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, and `no-slop-ui` returned “Failed to read skill file.” Their already-loaded task requirements and committed skill map informed the implementation; no files under `.github/skills/**` were changed.
- **Organic-tactile asset filename mismatch:** the skill points to `tactile.css`; the repository asset is `tacktile.css`. Retained `src/theme.css` as the only app color-token source and used existing tactile components and aliases; did not edit the immutable skill asset.
- **Audit policy discrepancy:** the placeholder checker ignores `.github/skills` and retains hard-coded approved marker line numbers, while the skills request a repository-wide audit. Ran the checker unchanged and recorded its result; did not alter its policy or immutable skill code.
