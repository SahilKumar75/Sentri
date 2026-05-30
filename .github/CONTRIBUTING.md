# Contributing to Sentri

## Working Agreement

Sentri should be developed using a review-first workflow even when only one developer is active.

### Required Git Flow

1. Never push directly to `main`.
2. Start non-trivial work from a linked GitHub issue.
3. Create a feature branch for every change.
4. Keep commits small and logical.
5. Push the branch to GitHub.
6. Open a pull request that references the issue.
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

### Issue and PR Hygiene

- Use the issue templates for bug reports and feature requests.
- A PR should close or clearly reference one tracked issue unless the change is emergency-only.
- Use `.github/pull_request_template.md` for every PR. Keep the summary short, link the issue, and list the verification commands that actually ran.
- The PR description should call out the exact frontend, backend, or ML worker surface touched.
- If a change is intentionally partial, note the follow-up issue in the PR body.

### Review Checklist

Before merging a PR, check:

- a linked issue exists for non-trivial work
- architecture impact is documented
- API contracts are explicit
- tests pass
- ML worker changes include `cd ml-worker && pytest` output or a clear reason it was not run
- mobile build still compiles
- no dead demo-only code path was introduced silently
- performance-sensitive reads and renders are considered

### Sentri Standards

- Frontend should prefer feature modules over giant screen files.
- Backend should keep controllers thin and services explicit.
- AI logic should be explainable, deterministic where possible, and upgradeable to model-backed flows later.
- UI/UX changes should preserve a coherent system, not one-off screens.

### Development Setup Verification

After setting up your development environment, verify that all services are working correctly:

- **Frontend**: `npm run dev` and check http://localhost:3000
- **Backend**: `npm run start:server` and check http://localhost:8000/health
- **ML Worker**: `cd ml-worker && pytest` (requires Python 3.9+)
- **Mobile**: `cd mobile && npm run build` (requires Android Studio for Android builds)
