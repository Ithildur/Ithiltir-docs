---
slug: /Developer/Guidelines
title: Development Guidelines
---

# Development Guidelines

This page applies to changes in Ithiltir, Ithiltir-node, the documentation site, and release scripts.

## Principles

- Keep existing user-visible behavior compatible.
- Prefer existing data structures, configuration patterns, script entry points, and error semantics.
- Add abstractions only when they remove real duplication or complexity.
- Internal refactors must not change public APIs, configuration keys, CLI flags, protocol fields, database migration results, or release package layout.
- Code and documentation must not present unimplemented behavior as fact.

## Public Contracts

The following are public contracts:

- Dash HTTP API paths, methods, request fields, response fields, and error codes.
- Ithiltir-node report protocol, CLI flags, install script behavior, and local mode behavior.
- `config.toml`, environment variables, theme packages, disk schema, metrics schema, and filesystem layout.
- Database migrations, retention policy, aggregation results, traffic billing semantics, and timezone semantics.
- Release asset names, archive formats, bundled file paths, and automatically installed dependencies.

When a public contract changes, update the corresponding documentation. If compatibility cannot be preserved, provide a migration path or an explicit version boundary.

## Implementation Requirements

- Reuse existing module boundaries before adding new modules.
- Do not add a general framework for a single call site.
- Do not document temporary development commands, debug fields, or unstable interfaces.
- Error codes should be stable, matchable, and documented with their trigger conditions.
- Configuration defaults must match code defaults.
- UI state refactors, frontend store migrations, hook changes, and similar internal implementation details do not belong in user documentation unless they change user-visible behavior.

## Testing Requirements

Not every change requires a new unit test.

Add tests or validate through a real path when a change affects:

- Public APIs, CLI behavior, configuration parsing, or error semantics.
- Database migrations, serialization, aggregation, retention policy, or billing cycles.
- State machines, concurrency, retries, cache invalidation, or permission checks.
- Installation, packaging, upgrades, release assets, or cross-platform scripts.
- Historical bug areas or paths with boundary-sensitive behavior.

Do not add tests that only pin implementation details, compiler-guaranteed behavior, or pure internal renames.

## Documentation Requirements

- Update both Chinese and English documentation for user-visible behavior changes.
- Document APIs, error codes, configuration keys, and data structures in reference pages or component pages.
- Document operational impact in operations or configuration pages.
- Document releases, builds, toolchains, and contribution rules under `Development and Releases`.
- Documentation should describe stable entry points, limits, and results, not temporary development process.

## Release Requirements

- Versions must follow SemVer.
- Release package names, bundled node versions, and asset paths must match release notes.
- Script dependency, Node.js version, GoReleaser version, and system dependency changes must update the build documentation.
- Release notes should list user-visible changes, migration requirements, compatibility impact, and known limitations.
