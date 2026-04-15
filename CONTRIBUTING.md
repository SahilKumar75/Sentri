# Contributing to Sentri

## Working Agreement

Sentri should be developed using a review-first workflow even when only one developer is active.

### Required Git Flow

1. Open an issue for each non-trivial change.
2. Never push directly to `main`.
3. Create a feature branch for every change.
4. Keep commits small and logical.
5. Push the branch to GitHub.
6. Open a pull request linked to the issue (for example: `Closes #123`).
7. Review the full diff before merging.
8. Merge only after the review notes are addressed.

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

### Issue + PR Hygiene

- Every non-trivial change should have an issue for context and acceptance criteria.
- Every pull request should link an issue and include a clear test plan.
- Pull requests should include focused review notes when the change has risk.

### Sentri Standards

- Frontend should prefer feature modules over giant screen files.
- Backend should keep controllers thin and services explicit.
- AI logic should be explainable, deterministic where possible, and upgradeable to model-backed flows later.
- UI/UX changes should preserve a coherent system, not one-off screens.
