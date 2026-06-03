---
slug: /Developer/AI-Policy
title: AI Policy
---

# AI Policy

Ithiltir accepts AI-assisted code, documentation, and script contributions. Contributors are responsible for the final submission.

The disclosure levels and acceptance boundaries in this policy are inspired by [Zulip's AI use policy and guidelines](https://zulip.readthedocs.io/en/latest/contributing/contributing.html#ai-use-policy-and-guidelines): AI may assist contributions, contributors must understand, test, and explain submissions, and `Auto` level contributions are not accepted.

## Scope

This policy applies to:

- Code, tests, scripts, configuration, and migration files.
- Documentation, release notes, translations, and examples.
- User-visible assets such as images, icons, audio, and video.

## Disclosure

AI assistance beyond basic completion should be disclosed in the Pull Request or change description.

Use these levels:

| Level | Meaning |
| --- | --- |
| `None` | No AI tools were used. Disclosure is not required |
| `Hint` | Completion or inline suggestions only. Disclosure is not required |
| `Assist` | Human-led work with AI used for local generation, explanation, or drafts |
| `Pair` | Human and AI jointly completed the main implementation |
| `Copilot` | Human defined the goal and reviewed the result; AI wrote most code or text |
| `Auto` | AI completed the main work autonomously and the human only confirmed high-level output. Not accepted |

`Assist`, `Pair`, and `Copilot` should be disclosed. `Auto` level contributions are not accepted.

## Acceptance Conditions

AI-assisted contributions must meet these conditions:

- The contributor understands the submission and can explain the implementation choices.
- The contributor has verified generated output against the current project code, APIs, configuration, and documentation facts.
- The contributor has run tests, builds, or real-path validation appropriate for the change risk.
- Generated content must not include secrets, private data, unauthorized third-party code, or license-unclear material.
- Documentation must not present AI inference as implemented behavior.
- Assets and translations must be reviewed by a human; user-visible assets should disclose AI generation.

AI output is not a technical rationale. Implementation rationale must come from code, requirements, compatibility, or runtime results.

## Unacceptable Cases

The following contributions may be required to be rewritten, split, or closed:

- The contributor cannot explain the core implementation.
- Material AI-generated content is not disclosed.
- Generated code conflicts with project APIs, error semantics, configuration, or protocols.
- A broad unverifiable refactor is introduced.
- Restricted-source code, documentation, or assets are copied.
- AI-generated release notes are not checked against actual changes.
- The contribution is at the `Auto` level.

If human responsibility, source, and validation cannot be confirmed, the contribution should not be merged.

## Restrictions

- Do not submit secrets, tokens, production databases, user data, private logs, or undisclosed security issues to external AI services.
- Do not use AI to bypass license, attribution, or security review.
- Do not use AI to rewrite public contracts in bulk unless compatibility notes and validation results are provided.
- Do not use AI-generated content directly in security-sensitive paths without human review and testing.

## Review Outcomes

Maintainers may request disclosure, explanation, test results, source notes, or human rewriting. Fixable issues with clear human intent can be revised and resubmitted. Contributions whose responsibility, source, or behavior cannot be verified should not enter a release.
