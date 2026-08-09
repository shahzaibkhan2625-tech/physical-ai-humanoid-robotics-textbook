# Specification Quality Checklist: RAG Chatbot ("chatbot")

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-09
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

**Iteration 1 — findings and fixes applied**

1. **Named technologies were removed from the requirements.** The request named Gemini, Qdrant,
   Neon Postgres, and the OpenAI Agents SDK. The first draft carried those names into the
   functional requirements, which fails "no implementation details" and would also make the
   requirements untestable as *requirements* — "MUST use Qdrant" is a constraint, not a behaviour.
   Fixed by stating requirements behaviourally ("retrieve passages by meaning", "persist each
   turn") and locating the technology choices where they belong: the constitution already fixes
   them under Technology & Security Constraints, and the spec's Dependencies section points there.
   Nothing was lost — the stack is still mandated, just not by this document.

2. **`POST /chat` and `GET /health` were replaced by named operations.** HTTP verbs, paths, status
   codes, and field names are wire-format decisions for `/sp.plan`. FR-033…040 define the *ask*,
   *conversation history*, and *health* operations by what they accept and return. The existing
   health operation is preserved by FR-036 as required. **Recorded deviation**: the request
   explicitly asked to "define the API it will need", so an interface section is present at all —
   this is intentional and logged as Assumption 1.

3. **"Answers must be grounded" was not testable as written.** Split into a chain that is:
   FR-011 (only retrieved passages), FR-012 (a stated rule for sufficiency, not a per-request
   judgement), FR-013 (refuse when insufficient), FR-015 (mark grounded vs refusal), FR-017 (never
   zero sources with a substantive answer), plus SC-003/SC-004/SC-005 as the measurements. The
   sufficiency rule itself is Assumption 5.

4. **Success criteria were unmeasurable without a measurement instrument.** SC-001…008 all assume
   an agreed question set. Rather than leave that implicit, the Success Criteria section defines
   the evaluation set up front and Assumption 11 makes it a deliverable of this feature. Without
   it, "answers are grounded" is an opinion.

5. **Two requirement areas were absent from the request and added deliberately.** (a) Prompt
   injection — the selected-passage field is client-controlled and flows into generation, so
   FR-019, FR-024, and SC-014 treat both client text and book text as data. (b) Dependency failure
   — three paid external services can each fail independently, so the edge cases, FR-032, FR-039,
   and SC-011 define behaviour for each, including the important one: history storage failing must
   not cost the reader their answer.

6. *"Written for non-technical stakeholders."* Passes on the reading that a non-engineer can read
   Overview, Scope, the user stories, and Success Criteria and judge whether this is the right
   feature. The requirements sections are necessarily precise, but they describe behaviour a
   reader would recognise, not internals.

7. **No [NEEDS CLARIFICATION] markers were used.** Six decisions were candidates: streaming vs
   complete responses, session privacy without auth, the sufficiency threshold, history retention,
   the added history-retrieval operation, and the ingestion source. Each had a defensible default,
   so all are recorded in Assumptions with rationale and reversal cost. Assumptions 1, 2, 6, and 7
   are the ones that would be expensive to reverse after the widget is built.

**Status**: All items pass after iteration 1 fixes. Ready for `/sp.clarify` (recommended — settle
Assumptions 6 and 7 before the interface is frozen) or `/sp.plan`.
