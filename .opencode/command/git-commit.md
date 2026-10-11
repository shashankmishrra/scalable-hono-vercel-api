---
description: Stage and commit changes with Conventional Commits, split into logical segments, each explaining why
agent: build
---

You are committing changes to this repository. Follow the project's commit rules exactly.

User input (optional scope, message hint, or instruction): $ARGUMENTS

## Rules

1. **Never commit secrets.** Inspect the staged/diff content for keys, tokens, or credentials before committing. Never stage `.env*`, key files, or credentials. Verify nothing sensitive is included.
2. **Segment, don't lump.** Group related changes into logically independent commits — one concern per commit. If the user names a scope or file, only commit that.
3. **Stage per segment.** Run `git add` on only the files belonging to the current commit, then commit, then move on. Never blindly `git add -A`.
4. **Conventional Commits + emoji.** Every subject is `<emoji> <type>(<scope>): <imperative summary>` with the type drawn from the emoji list below. Lowercase, imperative, no trailing period, under ~72 chars. The emoji always matches the type — use the list, never invent one.
5. **Explain WHY, not what.** The body must state the rationale and intent — why the change matters and what problem it solves — never a restatement of which files changed. A reviewer should understand the motivation without reading the diff.
6. **Match existing style.** Read `git log --oneline -10` first and stay consistent with prior messages.

## Emoji list

Use this mapping consistently. The emoji and type are a fixed pair — never mix or invent new ones.

| Emoji | Type | Use for |
|-------|------|---------|
| ✨ | `feat` | New feature or capability |
| 🐛 | `fix` | Bug fix |
| 📝 | `docs` | Documentation only |
| 💄 | `style` | Formatting/whitespace, no logic change |
| ♻️ | `refactor` | Code restructure, no behavior change |
| ⚡ | `perf` | Performance improvement |
| ✅ | `test` | Add or fix tests |
| 📦 | `build` | Build system or dependency changes |
| 👷 | `ci` | CI configuration |
| 🔧 | `chore` | Routine maintenance, tooling, misc |
| ⏪ | `revert` | Revert a previous commit |
| 🎉 | `init` | Initial commit / bootstrap |

## Steps

1. Run `git status --short` and `git diff --stat` (plus `git diff --cached` if anything is already staged) to understand the work.
2. Review `git log --oneline -10` for message style.
3. Identify logical segments from the changes.
4. For each segment: `git add <specific files>`, then `git commit -m "<emoji> <type>(<scope>): <summary>" -m "<why body>"`.
5. Finish with `git status` to confirm the working tree is clean and nothing unintended is left.

## Output

Report each commit made (subject, the one-line why, and the files in it) and confirm nothing sensitive was staged.
