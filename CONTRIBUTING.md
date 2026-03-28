# Contributing to Sentri

## Working Agreement

Sentri should be developed using a review-first workflow even when only one developer is active.

### Required Git Flow

1. Never push directly to `main`.
2. Create a feature branch for every change.
3. Keep commits small and logical.
4. Push the branch to GitHub.
5. Open a pull request.
6. Review the full diff before merging.
7. Merge only after the review notes are addressed.

### Branch Naming

- `codex/<feature-name>`
- `feature/<feature-name>`
- `fix/<issue-name>`

### Commit Quality

Each commit should do one meaningful thing:

- add one document
- extract one module
- introduce one service
- add one test case set
- integrate one feature path

Avoid mixing UI redesign, backend behavior, and infra changes in a single commit unless they are inseparable.

### Review Checklist

Before merging a PR, check:

- architecture impact is documented
- API contracts are explicit
- tests pass
- mobile build still compiles
- no dead demo-only code path was introduced silently
- performance-sensitive reads and renders are considered

### Sentri Standards

- Frontend should prefer feature modules over giant screen files.
- Backend should keep controllers thin and services explicit.
- AI logic should be explainable, deterministic where possible, and upgradeable to model-backed flows later.
- UI/UX changes should preserve a coherent system, not one-off screens.
