# Security Policy

## Supported Versions

Security fixes are handled on the `main` branch. The project is pre-release, so older snapshots are not maintained separately.

## Reporting a Vulnerability

Do not open public issues for vulnerabilities.

If GitHub private vulnerability reporting is enabled, use it from the repository Security tab. Otherwise, open a short issue asking for a private maintainer contact without including exploit details, secrets, tokens, or private user data.

Include the following in a private report:

- affected component: app, backend, ML worker, or repository workflow
- impact and likely attack path
- reproduction steps or proof of concept
- affected versions or commit range, if known
- suggested fix, if available

## Handling

Maintainers should acknowledge valid reports, assess severity, prepare a fix privately when needed, and publish a clear advisory or release note after the fix is available.

## Dependency Security

Dependency updates should go through normal pull request review. High-impact dependency changes should include the affected package, reason for the update, and verification command output.
