# CONSTITUTION — ProyectoBanco

> Project engineering agreement. Apply it within the user's instructions and authorized scope; resolve material conflicts explicitly rather than silently overriding decisions.

---

## 1. Governance & Code Surgery (Constitutional Foundation)

1. **Pre-Execution Diagnostic:** Before making any non-trivial change, present a structured assessment: *Problem, Proposed Solution, and Consequences/Risks*.
2. **Strict Non-Destructive Policy:** Destructive changes, large refactors, or database modifications require explicit approval.
3. **Evidence and uncertainty:** Distinguish verified facts, hypotheses and unresolved decisions. Inspect repository evidence first; ask the user about material ambiguity. Never invent business rules or claim certainty from a structural audit.
4. **Minimal Touch Surgery:** Modify exclusively the files necessary to achieve the verified objective. Do not touch adjacent working code or reformat unrelated modules.
5. **Demonstrable Quality Gates:** Record actual results and pre-existing failures. Automated gates must pass for automated verification; when none apply, document explicitly labeled manual evidence. A checklist is not proof of behavior.
6. **Backend Pragmatic Craft & Zero Code Slop:**
   - *Strict YAGNI & Direct Implementation:* Never add speculative abstraction layers, premature interfaces, DTOs, factories, or wrapper classes when a direct, idiomatic function or standard module satisfies the acceptance criteria.
   - *Zero Comment Slop:* Avoid comments that only narrate syntax. Preserve accurate API documentation and explanations of purpose, contracts and non-obvious domain constraints.
   - *Fail-Fast & Transparent Failures:* Strictly forbid defensive `try/catch` wrappers that swallow exceptions, return dummy nulls, or silently mask errors without a documented business requirement.
   - *Zero Spec & Plan Slop:* Specifications and plans must maintain high technical density: tabular evidence, explicit non-goals, and atomic, falsable criteria (`AC-01`). No marketing fluff, corporate filler, or conversational apologies.

---

## 2. Domain & Regulatory Invariants (General software project)

### 2.1 Applicable security boundaries
* Review what data and capabilities this project actually exposes. If authorization applies, enforce it at the trusted boundary and test unauthorized access.
* If the project is multi-tenant, document and test tenant isolation; do not introduce tenancy into a single-user tool.
* Avoid exposing secrets or sensitive data in logs and outputs.
### 2.2 Changes and recovery
* If persistence exists, preserve its documented integrity constraints and concurrency behavior.
* For migrations, choose and test a recovery strategy appropriate to the data and deployment; a down.sql file is not universally appropriate.
* If no database, UI or remote service exists, record N/A rather than creating one to satisfy a template.

These profile controls are review prompts; applicability must be established for this project. They do not certify regulatory compliance.

---

## 3. Technology Stack & Documentation Standards

* **Primary Tech Stack:** `Undecided`
* **Documentation Standard:** `Project conventions (review required)` (All public APIs, exported interfaces, and complex functions must follow this convention).

Agree and record the documentation convention per module/language: JSDoc for JavaScript, TSDoc or the project's established convention for TypeScript, Javadoc for Java, and the ecosystem equivalent elsewhere. Document public/exported APIs, components/hooks and nontrivial internal contracts with purpose, parameters, return value, errors, side effects and invariants where relevant. Keep signatures, types and examples accurate as code changes. Avoid syntax-narrating comments; this never excuses removing useful API documentation. Check the available documentation/lint tooling and review semantic accuracy; counting tags does not establish correctness.

### Supported technology decisions
Before new-project scaffolding, adding a major dependency or changing a runtime, inspect approved stack decisions, manifests, lockfiles, installed tool versions, CI and deployment targets. Distinguish declared, installed, supported and executed versions. For a material version decision, consult current official release/support policies and version-specific compatibility requirements on the web; record the exact source URL, consulted date, candidate version/channel, compatibility constraints and reason for selection.
Recommend a supported stable combination suited to the project. Neither the newest release nor a remembered old version is a default; LTS is relevant only where that ecosystem defines it. Compare runtime, framework, build tool and deployment requirements together. Respect an approved stack; surface unsupported versions or conflicts and propose a scoped alternative instead of silently upgrading.
Explain meaningful options to a nontechnical user and obtain a choice or use their explicit delegation before committing to the stack. Record approval/delegation separately from compatibility evidence. Prefer reproducible manifests/lockfiles and record actual installation/build results; a source recommending a version does not prove it runs locally.
Revalidate on setup, upgrades, compatibility conflicts or support expiry. Reuse relevant dated evidence for unchanged decisions rather than browsing on every small edit. If web access is unavailable and current support cannot be established, label the recommendation provisional and keep the dependent version decision unresolved; do not present training memory as current research. A registry version listing alone does not prove support or interoperability.
Use targeted primary-source research. A research subagent is optional only when supported, authorized and useful for an independent question; require exact sources, applicability and unresolved conflicts, and review its findings. Never require multiple agents or silently install a browsing service.

### Clarification and setup
Use the host's native structured question tool when it is actually available and permitted in the current mode; otherwise ask in the same chat or interactive console. Do not invent a tool name or require a particular host. Group a small number of material questions, explain the recommendation and trade-offs in plain language, and let the user delegate technical choices. A suggested option or silence is not approval.
Inspect before asking; reuse confirmed answers. Ask about goals, constraints and consequences, not facts discoverable from files. Continue independent work while an answer is pending; block only decisions that depend on it. Record the answer or explicit delegation and its scope. Do not repeatedly ask for authorization already given.
Guide setup according to the user's experience, without assuming they know Git or toolchain terminology. Record available, missing and unknown prerequisites, with a concrete next step and working directory for each blocker. Inspect OS/shell, repository boundary, required runtimes/package managers, services and isolated test data before proposing commands. Do not execute unreviewed install scripts or copy secrets into context.
Separate local version control from hosting: git init does not publish to GitHub. During read-only onboarding only inspect Git; when authorized project setup includes local Git initialization, first check for an existing or enclosing repository, preserve existing work, agree the repository location/initial branch and review ignore rules before any first commit. Never invent author identity, change global Git configuration, create a nested repository accidentally, or stage unrelated files. Missing Git need not block discussion/specification.
Record the commit convention before an authorized first commit. Preserve an established convention or propose Conventional Commits 1.0.0: type(scope): description, with scope optional; agree language, meaningful types and breaking-change notation. A chosen convention is not authorization to commit. Branches, commits, remotes, push, PRs, releases and deployment require appropriate user authorization; preserve an explicit local-only restriction until the user changes it.
Record whether native questions, current web research, terminal execution, rendered UI inspection and delegation are available, unavailable or unknown in this session. Never infer capability from an adapter or skill name. Explain fallbacks and dependent blockers without claiming the whole project is ready.

---

## 4. Delivery Quality Gates

The following commands must run and pass cleanly before considering any task or Pull Request complete:

```bash
# Not configured. Review project evidence with /omni-init.
```

---

## 5. UI Ergonomics & Frontend Craft (Anti-Slop)

For interface work, first identify intended users, their task, actual content/data, interaction constraints and the existing design system. Distinguish a landing page from an operational tool, mobile flow or other surface; do not apply one layout to every domain. Preserve approved identity, components and tokens, while correcting defects within the authorized scope.
For a new or substantially redesigned interface, use user-provided examples and relevant existing screens first. If direction is missing, research a small set of relevant real interfaces or official design-system examples using available web tools. Record source URL/path, date, the specific layout/interaction lesson and its applicability. Do not copy branding, unsupported claims, fabricated metrics or assets without appropriate rights. If references are inaccessible, disclose the gap and clarify the direction or proceed with an explicitly delegated provisional choice.
Define a direction through information hierarchy, composition, density, typography, spacing, colors and meaningful feedback. No blanket prohibition or mandatory recipe for cards, centered layouts, gradients or fixed dimensions. Avoid decorative repetition and content invented to fill a template. Reuse standard accessible controls where they serve the task; distinctiveness must not reduce clarity.
Before expanding a substantial uncertain design across screens, build a representative rendered surface or interactive prototype with realistic or authorized sample content and a demanding state. Seek feedback on that concrete result when a material preference is unresolved; respect prior decisions or delegated design choices rather than repeatedly asking permission. A small edit should not require several mockups.
Implement and exercise the complete affected journey. Review applicable normal, focus, loading, empty, error/recovery, validation, pending/success and protected states; record justified N/A, never invent latency or protections to fill a checklist. Check relevant viewport widths, long content, keyboard/focus, measured contrast, zoom/reflow and reduced motion. Use native/device tools where appropriate rather than assuming a web browser suits every UI.
Observe the final integrated render after corrections. Record environment, route/state, steps, actual outcomes and artifacts. Build success and source inspection do not establish visual or interaction quality; a screenshot alone does not establish functionality or accessibility. Without a suitable inspection tool, mark those checks NOT_VERIFIED and provide a concrete manual procedure. Do not claim visual approval from code alone.
