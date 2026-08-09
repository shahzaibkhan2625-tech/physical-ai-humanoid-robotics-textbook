# Feature Specification: RAG Chatbot ("chatbot")

**Feature Branch**: `002-chatbot`
**Created**: 2026-08-09
**Status**: Draft
**Input**: User description: "Create the specification for the RAG chatbot (feature: chatbot). A retrieval-augmented chatbot embedded in the published textbook. It answers reader questions using ONLY the book's own content, and can answer about a specific passage the reader has selected. Backend only in this spec — the UI widget is a later feature, but define the API it will need."

## Overview

A question-answering service for readers of the *Physical AI & Humanoid Robotics* textbook. A
reader asks a question; the service finds the passages of the book that bear on it, answers from
those passages, and shows the reader which passages it used. If the book does not cover the
question, the service says so rather than answering from general knowledge.

Two things make this feature what it is, and both are trust properties rather than capabilities:

1. **Grounded or silent.** Every answer traces to retrieved book content. An answer the book
   cannot support is a defect, not a nice-to-have improvement.
2. **Verifiable.** Every answer carries its sources, so a reader can check the book rather than
   trust the bot.

This spec covers the **service and its interface only**. The chat widget that will consume it is
a separate, later feature; this spec defines the contract that widget will be built against so it
is not invented twice.

## Scope

### In scope

- **Ingestion**: turning the book's published chapters into a searchable index, run offline and
  re-runnable when the book changes.
- **Retrieval**: finding the passages relevant to a reader's question.
- **Grounded answering**: producing an answer from those passages, or refusing when they do not
  support one.
- **Source attribution**: returning which passages an answer used.
- **Selected-text mode**: scoping an answer to a passage the reader highlighted.
- **Conversation continuity**: multi-turn conversations with persisted history.
- **The interface contract** the later chat widget will consume.
- **Operational behaviour**: what happens when a dependency is slow, unavailable, or rate-limited.

### Out of scope *(explicitly excluded from this feature)*

- **The chat UI widget and text-selection frontend** — all client-side work, including how a
  reader highlights text and how the conversation is rendered, is a later feature. This spec
  defines only what that widget may ask for and what it will receive.
- **Deployment to Hugging Face Spaces** — hosting, CI, secret provisioning in the deployed
  environment, and scaling are a later phase. This feature ends at a service that runs locally.
- **Authentication, accounts, and personalization** — there are no users, logins, roles, or
  per-reader tailoring. See Risks for what this implies about session privacy.
- **Translation and multilingual answering** — later features.
- **The book content itself** — authored under spec `001-book`. This feature consumes that
  content and must not modify it.
- **Analytics dashboards and feedback collection** — recording that a reader disliked an answer is
  a later feature.
- **Answering about anything other than the book** — general robotics help, code debugging for the
  reader's own project, and open-web questions are non-goals by design.

## User Scenarios & Testing *(mandatory)*

Two actors:

- **Reader** — someone reading the book who has a question. Reaches the service through the later
  widget; in this feature, exercised directly against the interface.
- **Maintainer** — the person who publishes the book and keeps the index in step with it.

### User Story 1 - Reader gets a grounded, cited answer (Priority: P1)

A reader hits something in Chapter 1.2 they do not follow and asks, "When should I use a service
instead of a topic?" They get an answer drawn from the book's own explanation, along with the
chapters it came from, so they can go read the full passage.

**Why this priority**: This is the feature. Everything else is a refinement of, or a guard on,
this one flow. It is also the smallest slice that proves the whole chain works end to end —
ingestion, retrieval, generation, and attribution.

**Independent Test**: Index the book, ask a question the book demonstrably answers, and confirm
the response is correct, is supported by the passages it cites, and names chapters that actually
contain the relevant material.

**Acceptance Scenarios**:

1. **Given** an indexed book, **When** a reader asks a question the book covers, **Then** they
   receive an answer that is factually consistent with the book and a non-empty list of sources.
2. **Given** an answer with sources, **When** the reader inspects each source, **Then** each names
   a real chapter, quotes or excerpts real book text, and is relevant to the question asked.
3. **Given** an answer, **When** it is compared against the cited passages, **Then** every factual
   claim in it is supported by those passages — no claim originates from the model's general
   knowledge.
4. **Given** a question phrased differently from the book's own wording ("how do I make two robot
   programs talk to each other?"), **When** it is asked, **Then** the relevant passage is still
   found — retrieval matches meaning, not keywords.

**Note**: ingestion is delivered as part of this story, because the story cannot exist without it.

---

### User Story 2 - Bot refuses honestly when the book does not cover it (Priority: P2)

A reader asks "What's the best ROS 2 package for quadruped gait generation?" — a reasonable
robotics question the book never addresses. The bot says the book does not cover it, and does not
improvise.

**Why this priority**: A confidently wrong answer costs more than a missing one. The book's own
constitution stakes its credibility on accuracy, and this bot quotes the book back to readers as
authoritative. This story is small, but it is **non-negotiable before the service is exposed to
any real reader** — a P1 with no P2 is worse than nothing.

**Independent Test**: Ask a set of questions verifiably outside the book's scope and confirm every
one is refused rather than answered.

**Acceptance Scenarios**:

1. **Given** a question on a topic the book does not contain, **When** it is asked, **Then** the
   response states the book does not cover it and offers no substantive answer from outside the
   book.
2. **Given** such a refusal, **When** the response is inspected, **Then** it is clearly marked as
   ungrounded, so the widget can render it differently from an answered question.
3. **Given** a question the book covers *partially*, **When** it is asked, **Then** the bot
   answers the covered part and explicitly says which part the book does not address — it does not
   silently fill the gap.
4. **Given** a question about a topic the book names but does not explain (something a chapter
   listed as out of scope), **When** it is asked, **Then** the bot says so and points to what the
   book does cover instead.
5. **Given** a question unrelated to the book's domain entirely ("what's the weather"), **When**
   it is asked, **Then** it is refused the same way — no separate small-talk path.

---

### User Story 3 - Reader asks about a passage they selected (Priority: P3)

A reader highlights a paragraph in Chapter 2.2 about inertia tensors and asks "what does this
mean?" The answer is about *that* paragraph, not about inertia in general.

**Why this priority**: It is what makes the bot feel embedded in the book rather than bolted on,
and it is the highest-value interaction for a confused reader. It depends on US1 working but adds
a distinct capability on top.

**Independent Test**: Send the same question twice, once with a selected passage and once without,
and confirm the selected-passage answer is scoped to that passage.

**Acceptance Scenarios**:

1. **Given** a reader-selected passage and a question about it, **When** the question is asked,
   **Then** the passage is the primary basis of the answer and appears among the sources.
2. **Given** a selected passage that needs background from elsewhere in the book, **When** the
   question is asked, **Then** supporting passages are also retrieved and cited — selection
   narrows the focus, it does not blind the retrieval.
3. **Given** an ambiguous question ("what does this mean?") that is unanswerable without a
   selection, **When** it is sent with a selection, **Then** it is answered; **When** sent without
   one, **Then** the bot asks what the reader is referring to rather than guessing.
4. **Given** a selected passage whose question cannot be answered from the book at all, **When**
   it is asked, **Then** the refusal behaviour of US2 still applies — selection does not license
   invention.

---

### User Story 4 - Conversation continues across turns (Priority: P4)

A reader asks a follow-up — "and what about the third one?" — and the bot understands it in the
context of what was just discussed. Returning to the book later, their conversation is still there.

**Why this priority**: Follow-ups are how people actually use a chatbot, but a single-turn bot is
still useful. History is also what makes later features (feedback, analytics, personalization)
possible, so it is worth building now even though its payoff is partly deferred.

**Independent Test**: Ask a question, then a follow-up that only makes sense in context, and
confirm it is interpreted correctly. Then re-read the conversation from storage.

**Acceptance Scenarios**:

1. **Given** a conversation with prior turns, **When** a follow-up relies on earlier context,
   **Then** it is interpreted in that context.
2. **Given** a conversation identifier, **When** the conversation is retrieved, **Then** all its
   questions and answers come back in order, with the sources each answer used.
3. **Given** a first-time reader with no identifier, **When** they ask a question, **Then** a
   conversation is created for them and its identifier is returned for reuse.
4. **Given** a follow-up in an existing conversation, **When** it is answered, **Then** grounding
   and refusal behaviour are unchanged — history never becomes a substitute for retrieved content.
5. **Given** an unrecognised conversation identifier, **When** a question is sent with it, **Then**
   the request is rejected with a clear reason rather than silently starting a new conversation.

---

### User Story 5 - Maintainer re-indexes after the book changes (Priority: P5)

A chapter is rewritten. The maintainer re-runs ingestion, and the bot immediately stops quoting the
old text and starts quoting the new.

**Why this priority**: Without it the bot silently rots into quoting a book that no longer exists —
a slow, invisible correctness failure. It is last only because it does not block first delivery,
not because it is optional.

**Independent Test**: Index the book, change a chapter, re-index, and confirm answers reflect the
new content and that no passage from the old version can still be returned.

**Acceptance Scenarios**:

1. **Given** an indexed book, **When** a chapter is edited and ingestion is re-run, **Then**
   answers cite the new text and the removed text is no longer retrievable.
2. **Given** a chapter that is deleted or renamed, **When** ingestion is re-run, **Then** its
   passages disappear from the index and no source ever points at a chapter that no longer exists.
3. **Given** ingestion is re-run with no book changes, **When** it completes, **Then** the index is
   equivalent to before — repeat runs do not duplicate passages.
4. **Given** ingestion fails partway, **When** the maintainer inspects the outcome, **Then** the
   failure is reported plainly and the previously working index is still serving answers.
5. **Given** a completed run, **When** the maintainer reviews its report, **Then** it states how
   many chapters and passages were indexed, so an accidentally empty run is obvious.

---

### Edge Cases

**Input**

- **Empty or whitespace-only question** → rejected with a clear reason; nothing is stored, nothing
  is billed.
- **Extremely long question or selected passage** → bounded by a stated limit and rejected above
  it, rather than truncated silently or passed through at unbounded cost.
- **Question in a language other than English** → the book is English-only; the bot answers in
  English or states the limitation. It must not silently produce a low-quality translation.
- **Selected text that is not from the book** (fabricated, or pasted from elsewhere) → treated as
  untrusted input. The bot does not accept it as book content, and grounding requirements still
  apply.
- **Selected text containing instructions** ("ignore previous instructions and…") → treated as
  data to be discussed, never as instructions to follow. Same for any instruction-like text inside
  the book itself.
- **A question about the chatbot rather than the book** ("what model are you?") → out of scope for
  grounded answering; handled as a refusal, not by disclosing configuration.

**Retrieval**

- **Nothing retrieved above the relevance bar** → the US2 refusal path, not an empty answer.
- **Weak or marginal matches** → treated as insufficient. The bar for answering must be a stated,
  testable rule, not a judgement made per request.
- **Retrieved passages contradict each other** (a concept refined between modules) → the answer
  reflects both and cites both rather than silently picking one.
- **The index is empty** (ingestion never ran) → the service reports itself unable to answer, and
  this is distinguishable from "the book does not cover that", because the operator's fix is
  entirely different.

**Dependencies**

- **The language model is unavailable, slow, or rate-limited** → the reader gets a clear, honest
  failure and is told it is temporary. No partial or fabricated answer is emitted.
- **The vector store is unavailable** → the same; the service must not fall back to answering from
  the model's own knowledge, because that silently breaks the feature's core promise.
- **History storage is unavailable** → answering continues and the answer is returned; only
  persistence is lost. The response indicates the turn was not saved. Losing history must not cost
  the reader their answer.
- **A dependency responds slowly** → a stated timeout applies, after which the reader gets a
  timeout message rather than an indefinite wait.

**Concurrency and volume**

- **Two questions sent to one conversation at the same time** → both are handled and both are
  stored; history order stays coherent.
- **A burst of requests from one source** → bounded, so the service cannot be driven into
  unlimited third-party cost by one client. The endpoint is unauthenticated (see Risks).

## Requirements *(mandatory)*

### Functional Requirements — Ingestion

- **FR-001**: The system MUST build a searchable index from the book's published chapters,
  covering every chapter of every module.
- **FR-002**: Ingestion MUST run offline as a maintainer-invoked operation, not as part of
  answering a reader's question.
- **FR-003**: Chapters MUST be divided into passages small enough to be individually relevant and
  large enough to be individually understandable. Passage boundaries MUST respect chapter and
  section structure rather than cutting mid-explanation.
- **FR-004**: A code example MUST NOT be split across passages, and a passage containing code MUST
  retain the prose that explains it.
- **FR-005**: Every passage MUST retain the metadata needed to cite it: module, chapter title, the
  section within the chapter, and a link a reader can follow to that place in the published book.
- **FR-006**: Ingestion MUST be repeatable — re-running it on unchanged content MUST NOT create
  duplicate passages.
- **FR-007**: Ingestion MUST remove passages belonging to chapters that no longer exist or have
  been rewritten, so no answer can cite content that is no longer in the book.
- **FR-008**: Ingestion MUST report what it did — chapters processed, passages produced, and any
  chapter it failed on — so an incomplete run is visible rather than silent.
- **FR-009**: A failed ingestion run MUST leave the previously working index intact and serving.

### Functional Requirements — Retrieval and grounding

- **FR-010**: The system MUST retrieve passages by meaning, so that a question phrased unlike the
  book still finds the right passage.
- **FR-011**: Answers MUST be generated **only** from retrieved book passages and the
  conversation's own history. The system MUST NOT answer from the model's general knowledge.
- **FR-012**: The system MUST apply a stated, testable rule for deciding whether retrieved
  passages are sufficient to answer, rather than deciding case by case.
- **FR-013**: When retrieved passages are insufficient, the system MUST state that the book does
  not cover the question and MUST NOT provide a substantive answer anyway.
- **FR-014**: When the book covers a question only partially, the system MUST answer the covered
  part and explicitly name what it cannot address.
- **FR-015**: Every response MUST carry a machine-readable indication of whether it is grounded or
  a refusal, so the client can render the two differently.
- **FR-016**: Every grounded answer MUST return its sources: for each, the module, chapter, section,
  a link into the published book, and the excerpt used.
- **FR-017**: A grounded answer MUST have at least one source. Zero sources with a substantive
  answer is a defect.
- **FR-018**: Sources MUST be limited to those that actually informed the answer — the system MUST
  NOT pad the list with every passage it retrieved.
- **FR-019**: Text supplied by the client (question, selected passage) and text originating in the
  book MUST both be treated as data, never as instructions that can change the system's behaviour
  or grounding rules.

### Functional Requirements — Selected-text mode

- **FR-020**: The system MUST accept an optional reader-selected passage alongside a question.
- **FR-021**: When a passage is supplied, it MUST be the primary context for the answer.
- **FR-022**: Supplying a passage MUST NOT disable retrieval; supporting passages from elsewhere
  in the book MUST still be retrieved and cited where they are needed.
- **FR-023**: Grounding and refusal rules (FR-011, FR-013) MUST apply unchanged in selected-text
  mode.
- **FR-024**: Client-supplied selected text MUST be treated as untrusted. The system MUST NOT
  present it as verified book content in its sources unless it corresponds to indexed content.

### Functional Requirements — Conversation and history

- **FR-025**: A question MAY include a conversation identifier. Without one, the system MUST create
  a conversation and return its identifier.
- **FR-026**: The system MUST persist each turn — the question, the answer, the sources used, and
  when it happened.
- **FR-027**: Prior turns in a conversation MUST be available as context so follow-up questions
  resolve correctly.
- **FR-028**: History MUST be retrievable in order for a given conversation, so a returning reader's
  widget can restore what was said.
- **FR-029**: Conversation history MUST NOT be used as a source of facts about the book. Only
  retrieved passages ground an answer.
- **FR-030**: An unrecognised conversation identifier MUST be rejected with a clear reason rather
  than silently starting a new conversation.
- **FR-031**: Conversation identifiers MUST be unguessable, because anyone holding one can read
  that conversation (there is no authentication — see Risks).
- **FR-032**: If history storage is unavailable, the system MUST still answer, and MUST indicate in
  the response that the turn was not persisted.

### Functional Requirements — Interface

The chat widget is a later feature, but it will be built against this contract. Defined here so it
is agreed once rather than invented twice. Shapes are described by meaning, not by wire format.

- **FR-033**: The service MUST expose an **ask** operation accepting: the question (required); a
  conversation identifier (optional); a selected passage (optional); and, where the client knows
  it, the location in the book the reader is currently reading (optional, to bias retrieval).
- **FR-034**: The ask operation MUST return: the answer text; whether it is grounded or a refusal;
  the sources used; the conversation identifier; and whether the turn was persisted.
- **FR-035**: The service MUST expose a **conversation history** operation returning a
  conversation's turns in order, so a widget can restore an in-progress conversation.
- **FR-036**: The existing **health** operation MUST be retained and MUST continue to report
  service liveness.
- **FR-037**: The health report MUST distinguish "the service is running" from "the service can
  actually answer questions" — reachability of the index, the model, and history storage, and
  whether an index exists at all.
- **FR-038**: Invalid requests MUST be rejected with a reason specific enough for a client
  developer to correct the request without reading the source.
- **FR-039**: Failures MUST be distinguishable by cause: bad request, unknown conversation, index
  not built, dependency unavailable, and rate-limited must not collapse into one generic error.
- **FR-040**: Error responses MUST NOT expose configuration, credentials, connection strings, or
  internal paths.

### Non-Functional Requirements

- **NFR-001**: A reader MUST receive an answer within 5 seconds for 95% of questions under normal
  conditions, and MUST see a clear failure rather than an indefinite wait after 30 seconds.
- **NFR-002**: The service MUST handle at least 10 concurrent readers without degrading below
  NFR-001.
- **NFR-003**: Credentials MUST be supplied through environment configuration only, never
  committed. Required variable names MUST be documented with no real values (Constitution:
  Technology & Security Constraints).
- **NFR-004**: Request volume from a single client MUST be bounded, so one client cannot drive
  unlimited third-party cost.
- **NFR-005**: Every question, refusal, and dependency failure MUST be observable in logs, with
  enough detail to diagnose a bad answer after the fact. Logs MUST NOT contain credentials.
- **NFR-006**: The service MUST run on Python 3.12 with dependencies added through the project's
  package manager (Constitution: Technology & Security Constraints).
- **NFR-007**: Grounding and refusal behaviour MUST be verifiable by an automated test suite, not
  only by manual inspection — this is the feature's core promise and MUST NOT be able to regress
  unnoticed.

### Key Entities

- **Passage (chunk)**: a retrievable piece of one chapter, with its text, its meaning-based search
  representation, and the metadata needed to cite it (module, chapter, section, link into the
  published book).
- **Index**: the complete searchable collection of passages for one version of the book. Rebuilt
  by ingestion; the sole permitted basis for factual answers.
- **Ingestion run**: one attempt to rebuild the index, with its outcome, counts, and failures.
- **Conversation (session)**: an ordered series of turns under one unguessable identifier. No
  owner, because there are no accounts.
- **Turn**: one question and its answer, with the sources used, whether it was grounded, and when
  it happened.
- **Source citation**: the link between an answer and one passage that supported it — module,
  chapter, section, link, and the excerpt used.
- **Selected passage**: reader-highlighted text supplied with a question. Untrusted input, primary
  context, not automatically a citable source.

## Success Criteria *(mandatory)*

Measured against an **evaluation set** built once the book exists: at least 30 questions the book
demonstrably answers, at least 15 it demonstrably does not, and at least 10 selected-passage
questions — each with a human-agreed expected outcome and expected source chapters.

### Measurable Outcomes

- **SC-001**: At least 90% of evaluation questions the book covers receive an answer judged
  correct and consistent with the book.
- **SC-002**: At least 95% of grounded answers cite at least one source that a reviewer agrees is
  the right place in the book.
- **SC-003**: **100% of out-of-scope evaluation questions are refused.** Zero fabricated answers.
  This target is not negotiable downward — one hallucinated answer fails the criterion.
- **SC-004**: 100% of substantive answers carry at least one source; zero answers arrive with an
  empty source list.
- **SC-005**: Zero factual claims in a sample of reviewed answers originate outside the cited
  passages.
- **SC-006**: At least 90% of selected-passage questions produce an answer a reviewer agrees is
  scoped to the selected passage, and every one includes that passage's context among its sources.
- **SC-007**: Questions phrased in wording that does not appear in the book still retrieve the
  correct chapter in at least 85% of evaluation cases.
- **SC-008**: 100% of follow-up questions in the evaluation set that depend on prior context are
  interpreted correctly.
- **SC-009**: 100% of conversations can be retrieved in full and in order after the fact; zero
  turns lost while history storage is available.
- **SC-010**: A reader receives an answer within 5 seconds for 95% of questions, and never waits
  longer than 30 seconds without a clear failure message.
- **SC-011**: With any single dependency unavailable, 100% of requests return a clear, honest
  failure — zero hang indefinitely and zero return an ungrounded answer.
- **SC-012**: Re-running ingestion after a chapter edit makes the new text retrievable and the
  removed text unretrievable, with zero duplicate passages; verifiable by count and by query.
- **SC-013**: Zero credentials appear in tracked files, logs, or error responses.
- **SC-014**: 100% of attempts to override the system's behaviour through instruction-like text in
  a question or a selected passage fail to change grounding or refusal behaviour, measured against
  a dedicated set of such attempts.
- **SC-015**: A client developer can build the chat widget against the documented contract without
  reading the service's source code.

## Assumptions

Decisions taken without explicit direction. Each is reversible, but several are expensive to
reverse once the widget is built against them — raise disagreements before planning.

1. **The interface contract belongs in this spec.** The request said the widget is a later feature
   but asked to "define the API it will need", so FR-033…040 describe operations and their
   meaning. They deliberately stop short of wire format, status codes, and field names — those are
   planning decisions.
2. **A history-retrieval operation is required** (FR-035), though it was not requested. A widget
   that persists conversations but cannot read them back can never restore one, which would make
   the history requirement pointless.
3. **Ingestion reads the published chapter files** as authored under spec `001-book`, not a
   rendered site. Cheaper, more reliable, and available before anything is deployed.
4. **Sources link into the published book** by chapter and section anchor. A citation the reader
   cannot click is only half a citation.
5. **The bar for "the book covers this"** is a two-gate rule: retrieved passages must clear a
   relevance threshold, *and* the answering step must independently judge them sufficient. Either
   gate failing produces a refusal. The threshold is tuned against the evaluation set during
   implementation, not guessed now.
6. **Answers are returned complete, not streamed.** Simpler to build and to test for grounding.
   Streaming is a widget-experience improvement that can be added later — but it is a contract
   change, so it is flagged rather than assumed away.
7. **Conversations are anonymous, and possession of the identifier is the only access control.**
   There is no auth in this feature. Identifiers must therefore be unguessable (FR-031). See Risks.
8. **English only**, matching the book.
9. **History is retained indefinitely** for now. There are no accounts and no personal data is
   solicited, so no retention or deletion policy is defined here; it becomes necessary when auth
   arrives.
10. **Rate limiting is per client address**, since there is no identity to attach it to.
11. **The evaluation set is a deliverable of this feature**, built alongside the service. Without
    it, SC-001…008 are unmeasurable and NFR-007 is unimplementable.
12. **The bot has no persona and no small talk.** Every question is treated as a book question and
    refused if the book does not answer it.
13. **Passage sizing is a tuning decision**, not a spec decision. FR-003/FR-004 state the
    constraints the sizing must satisfy; the values are set during implementation against the
    evaluation set.

## Dependencies

- **Spec `001-book`** — hard dependency. Retrieval quality cannot be measured before chapters
  exist, and the evaluation set cannot be written before then. Ingestion and the interface can be
  built against partial content; SC-001…008 cannot be met until the book is substantially written.
- **Constitution v1.0.0** — Technology & Security Constraints fix the model, embeddings, vector
  store, history storage, secret handling, Python version, and dependency management.
- **Existing backend scaffold** — a service already exists with a health operation that this
  feature extends rather than replaces.
- **Third-party services** — a language model and embedding provider, a vector store, and a
  managed database. All are external, all can fail, and all cost money per request; FR-039,
  NFR-004, and the dependency edge cases exist because of this.
- **Credentials** must be available in local configuration; the required variable names are already
  documented in the repository's example environment file.

## Risks

- **Anonymous conversations are readable by anyone holding the identifier.** With no
  authentication, an identifier is a bearer token. Mitigation: unguessable identifiers (FR-031),
  no personal data solicited, and no listing operation that would let identifiers be enumerated.
  This is an accepted limitation of a pre-auth feature and MUST be revisited before the service
  handles anything sensitive.
- **An unauthenticated endpoint backed by paid third-party services is a cost-exhaustion target.**
  One client in a loop can spend real money. Mitigation: NFR-004 rate limiting, bounded input
  sizes, and cost-visible logging. Deployment (a later phase) must not expose this endpoint
  without those in place.
- **Grounding can regress invisibly.** A prompt change or a model update can quietly turn a
  refusing bot into a confabulating one, and nothing about the service looks broken when that
  happens. Mitigation: NFR-007 and SC-003 make refusal an automated test, and the evaluation set
  (Assumption 11) is a deliverable rather than an afterthought.
- **Chapters can change without re-ingestion**, leaving the bot quoting a book that no longer
  exists. Mitigation: US5 and FR-007; re-ingestion should become part of the book's publish
  routine when deployment is specified.
