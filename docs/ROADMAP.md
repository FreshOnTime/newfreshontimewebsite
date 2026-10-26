# FreshPick product roadmap: agentic commerce

**Status:** Proposed implementation plan; not an announcement of shipped AI agents.  
**Reviewed:** 26 October 2026.  
**Primary goal:** Make grocery shopping, replenishment, and store operations easier through narrowly scoped, auditable AI-assisted workflows while preserving the existing commerce domain's ownership, pricing, stock, and payment rules.  
**Initial market:** Sri Lanka; quote and display prices in LKR; customer checkout remains cash on delivery (COD).

> This is the forward-looking roadmap. [FEATURES.md](FEATURES.md) describes features currently implemented; [PLATFORM_READINESS.md](PLATFORM_READINESS.md) and [OPERATIONS.md](OPERATIONS.md) define production acceptance. Estimated durations below are planning ranges for a small team, not delivery commitments.

## 1. What exists versus what is planned

| Capability | Code today | Proposed direction |
| --- | --- | --- |
| Public catalogue discovery | Read-only MCP tools: **search_products**, **get_product**, **list_categories** via app/api/mcp/route.ts and lib/mcp/server.ts | Keep public MCP read-only; expose account-specific tools through a separate authenticated boundary |
| Customer personalization | Taste Graph, recommendations, trending products, and replenishment candidates in lib/intelligence/tasteGraph.ts; app/api/intelligence/me/route.ts | Add explainable, opt-in conversational shopping and replenishment workflows |
| Operations intelligence | Deterministic stock-risk, demand, and supplier summaries in lib/intelligence/operations.ts and protected admin API | Convert insights to approval-required reorder and exception-handling *proposals* |
| Commerce | Saved bags, server-side pricing/quote, COD orders, transactional stock reservation, idempotency, subscriptions | Agents can search, plan, and create **draft bags**; checkout stays within the existing server-validated order flow |
| Supplier operations | Supplier onboarding, spreadsheet upload, and admin-reviewed import | Suggest catalogue mappings/cleaning and flag duplicates; no automatic publishing |
| Automated agent workflow, LLM chat, authenticated write-capable MCP, online payments | **Not implemented** | Deliver in phases; no autonomous charges, payouts, supplier purchases, or order placement without approval |

**Security baseline:** [PR #136](https://github.com/FreshOnTime/newfreshontimewebsite/pull/136) was merged and addressed role/permission API guards, archived public products, bag concurrency, and checkout retry requirements. It does **not** constitute a complete authorization/security certification.

## 2. Prioritized outcomes

| Priority | Feature | Who benefits | Safe first version | Dependencies |
| --- | --- | --- | --- | --- |
| P1 | **AI grocery shopping assistant** | Customers | Interpret a request, retrieve real products, plan within a budget, explain substitutions, and show a draft bag for review | Tool/policy layer, current prices and stock |
| P1 | **Smart replenishment assistant** | Repeat customers | Suggest due items from purchase history; prepare a draft bag after opt-in | Existing Taste Graph; preferences and consent |
| P1 | **Inventory replenishment copilot** | Operations/admin | Explain stockout risk and draft reorder recommendations, not purchase orders sent to suppliers | Existing deterministic forecasts; staff permissions |
| P2 | **Meal planning to basket** | Families and regular shoppers | Turn meal preferences, household size, and an LKR budget into a suggested list of available products | Validated product units/variants and catalogue attributes |
| P2 | **Supplier catalogue copilot** | Suppliers and catalogue admins | Detect duplicates and unit/format errors, suggest categories and copy for admin approval | Staged imports, product provenance, audit |
| P2 | **Order-support assistant** | Customers/support team | Summarize the authenticated user's order status and policy; hand off unresolved issues | Order ownership, approved policy knowledge |
| P2 | **Admin operations copilot** | Store staff | Summarize overdue deliveries, failed emails, unfulfilled orders and suggested next actions | Admin health/operations APIs, staff authorization |
| P3 | **B2B procurement assistant** | Restaurants/business buyers | Draft recurring bulk orders and quotation requests without committing a transaction | B2B access model, price lists, approval workflow |
| P3 | **External authenticated agent access** | Trusted integrations | Scoped, auditable account actions via separate authenticated MCP/agent API | OAuth/scopes, monitoring, distributed quotas |

**Recommended MVP:** AI grocery assistant + budget-aware draft bag + quote preview. Avoid starting with a swarm of independent agents or autonomous checkout.

## 3. Phase plan, dependencies and exit criteria

The ranges are **engineering effort estimates**, assuming one experienced full-stack engineer supported by product/operations review, usable test fixtures and existing CI. Integration approvals, data cleanup and user research can extend the timeline. Phases may overlap only when their safety dependencies are satisfied.

| Phase | Indicative effort | Deliverable | Exit gate |
| --- | --- | --- | --- |
| **0 — Commerce hardening** | 1–2 weeks | Remaining prerequisite defects, security and monitoring backlog | Stable verified quotes/units, authorized mutations, safe production configuration |
| **1 — Agent foundation** | 1–2 weeks | Server-side orchestration, typed tools, permission checks, trace IDs, feature flag, evaluation harness | Read-only assistant cannot access another user's data or execute writes |
| **2 — Customer shopping MVP** | 2–4 weeks | Chat UI, budget-aware basket planning, draft-bag tools, authoritative quote preview | Customer approves every bag change; prices match normal checkout |
| **3 — Replenishment and meal planning** | 2–3 weeks | Opt-in reorder suggestions, preferences, substitutions and planned meal baskets | No unwanted repeat orders; measurable usefulness with user testing |
| **4 — Operations and supplier copilots** | 2–4 weeks | Reorder proposals, supplier catalogue suggestions, ops exception summaries | Every inventory/supplier change is reviewed, authorized and audited |
| **5 — Integration and B2B expansion** | 3–6+ weeks | Scoped external agent access, B2B drafts, support workflows | Threat model and tenant/permission tests pass before opening external writes |

### Phase 0 — Safety and commerce data prerequisites

- **C0.1 Dependency review:** Run a fresh dependency/secret/security scan, triage [issue #84](https://github.com/FreshOnTime/newfreshontimewebsite/issues/84), upgrade affected dependencies incrementally, and document remaining accepted risk. Do not treat the historical alert count as a current count.
- **C0.2 Correct Smart Basket creation pricing:** In app/api/intelligence/me/route.ts, confirm both new-item creation and existing-item updates use the **same** discounted sale-price function. The current new-item create branch still passes the raw product price; add a regression test for discounted products.
- **C0.3 Product variants/units:** Decide whether grams, kilograms and packaged sizes share stock or have distinct SKUs. Introduce **ProductVariant** / variant-level inventory if needed; preserve a canonical unit conversion and quoted-price snapshot through bag → quote → order. Do not let an agent assume that 1 kg equals one stock unit.
- **C0.4 Delivery and inventory correctness:** Reconfirm COD quote freshness, delivery-area validation, cancellation/stock restore, duplicate retries, subscriptions, and product ownership under concurrent requests.
- **C0.5 Rate limiting and observability:** Replace per-process MCP rate limits where deployment-wide limits are required; add uptime, error and worker-backlog alerting; establish consented analytics before collecting agent interactions.
- **C0.6 Production and staging:** Use isolated preview database and supplier fixtures. Validate deployment configuration and backup/restore steps from OPERATIONS.md.

**Done when:** Price/quantity correctness is reproducible in DB-backed tests; high-priority exposures are addressed; no AI feature can bypass current checkout or authorization rules.

### Phase 1 — A minimal, safe agent platform

Create a small server-side orchestration boundary within the existing Next.js application. Use a replaceable model/provider adapter; deterministic pricing and authorization remain in domain services, **not** in LLM output.

**Proposed modules (not existing yet):**

| Proposed location | Responsibility |
| --- | --- |
| lib/agents/orchestrator.ts | Intents, tool selection, finite turns, time/cost budgets, fallbacks |
| lib/agents/tools/catalogue.ts | Typed public reads backed by existing catalogue services |
| lib/agents/tools/account.ts | Authenticated, owner-scoped bag/order reads and draft mutations |
| lib/agents/tools/operations.ts | Staff-scoped read/proposal tools |
| lib/agents/policy.ts | Role/scope checks, allowlisted tools, approval requirements, per-call limits |
| lib/agents/evals/ | Golden tasks, prompt-injection cases, regression assertions |
| app/api/assistant/route.ts | Authenticated customer assistant endpoint, behind a feature flag |
| app/assistant/page.tsx | In-app shopping assistant; accessible alternative to ordinary shopping |

**Implementation order:** (1) provider adapter and structured output validation; (2) read-only product tool; (3) authenticated account context/ownership guard; (4) audit/telemetry and budgets; (5) write proposals with explicit approval; (6) CI evaluations. Prefer existing Zod validators and domain services.

An agent may suggest an action, but the backend must recalculate all monetary amounts and reject unauthorized, stale or unapproved writes. Product descriptions, supplier spreadsheets and retrieved text are **untrusted data**, never executable instructions.

**Done when:** Rate limits, per-customer isolation, traces, model-failure fallbacks and strict tool allowlists are tested, without exposing sensitive account data to the anonymous public MCP server.

### Phase 2 — AI grocery assistant MVP

**Target journey:** “Build a five-day grocery bag for three people under Rs. 5,000.” The assistant:

1. Extracts user constraints (budget LKR, household, exclusions, availability and delivery region) and clarifies only essential missing constraints.
2. Calls the real catalogue search; ranks only active, purchasable, in-stock products. Product names, prices and availability are always grounded in tool responses.
3. Produces a proposed set of product IDs, quantities, optional replacements and a concise rationale. The model's arithmetic is **not** authoritative.
4. Invokes the same server-side pricing/quote service the normal checkout uses, including delivery policy. If a plan exceeds budget, revise it using new quotes.
5. Shows an itemized **reviewable draft**. A user action approves creation/update of their own saved bag; no silent bag modifications.
6. The user proceeds through normal checkout and explicitly confirms the COD order. A fresh quote/stock check and unique Idempotency-Key are required.

**Proposed internal tool contracts:**

| Tool | Input | Output | Side-effect policy |
| --- | --- | --- | --- |
| search_catalogue | query, category, optional budget filters, bounded limit | IDs, SKUs, descriptions, current sale price, stock flags | Read-only |
| get_product_details | productId or SKU | Product options and eligible sale units | Read-only |
| get_my_bags | Derived user identity, never a model-supplied userId | Only current user's bags | Read-only |
| propose_bag | Product IDs, whole quantities/variant IDs, named substitutions | Validated draft and missing-item warnings | No database write |
| confirm_draft_bag | Approved proposal ID and revision token | Customer-owned bag | User approval required |
| preview_checkout | Bag/line-item IDs and delivery location | Fresh server quote, expiry/fingerprint, delivery eligibility | Read-only |
| get_my_orders | Authenticated caller, bounded pagination | Own order summaries | Read-only; Phase 5 support scope |

**Explicitly deferred:** In-chat unattended order placement, card payments, discounts controlled by the model, refunds, admin writes and general-purpose database/query tools.

**Done when:** Real product/discount/stock values are reflected in quotes; out-of-stock and price-change conflicts are recoverable; repeated confirmation cannot create duplicate orders; an external prompt in a product description cannot trigger a tool action.

### Phase 3 — Personalized replenishment and meal planning

- Reuse lib/intelligence/tasteGraph.ts's purchase intervals and recommendation signals; show confidence/why an item is due and allow dismissal, exclusions and opt-out.
- Generate suggested weekly bags from confirmed preferences (allergens, budget, dietary constraints), without claiming verified allergen safety where catalogue information is missing.
- Enforce a deterministic substitute policy: category/unit/price limits, explicit user approval and a current-stock recheck. Never silently replace with an allergen-sensitive item.
- Send reminders only after channel-specific consent; use the existing notification/email outbox when suitable. No scheduled model workflow should create a live order without new, explicit authorization.

**Done when:** Opt-out works, no unrequested purchases occur, and the ordinary manual/stock-managed subscription lifecycles remain unchanged.

### Phase 4 — Operations, inventory and supplier copilots

- Build an **inventory recommendation** UI from lib/intelligence/operations.ts forecasts. Show input window, current stock, suggested reorder size, uncertainty and supplier data. The model explains numbers; it does not invent stock or override thresholds.
- Introduce a **draft supplier reorder** object, with owner, status, version, supplier ID, line items, explanation and approval history. Only an authorized staff member can approve/send an actual purchase request.
- Build a **supplier catalogue assistant** on top of the admin-reviewed spreadsheet import: preview row errors, duplicate SKU candidates, missing unit facts and possible categories; preserve raw source values and provenance. Require approval before publishing or adjusting prices.
- Provide an **operations summary** of failed mail, overdue subscription deliveries and blocked order flows using existing protected endpoints. Escalate rather than retry irreversible actions automatically.

**Done when:** Staff can trace every recommendation back to source records and reject it; approvals are authenticated/versioned; supplier data cannot change permissions or execute instructions.

### Phase 5 — External agent interoperability and B2B

- Retain **/api/mcp** as anonymous, bounded, public read-only catalogue discovery.
- If externally invoked private tools are needed, design a **separate authenticated endpoint** with scoped OAuth/token grants, per-tool authorization, revocation, distributed rate limiting, request logging and data minimization. Never put private tools into the anonymous MCP server.
- For B2B, begin with draft purchase lists/quotation requests and company account authorization, not split payments or automated supplier purchasing.
- Add order-support explanations with authenticated ownership, curated policy sources and human escalation, rather than speculative delivery promises.

**Done when:** Cross-user, cross-company and prompt-injection tests pass and administrators can audit and revoke external app access.

## 4. Architecture and trust boundaries (proposed)

~~~mermaid
flowchart TD
    C[Customer / Admin / Supplier UI] --> A[Authenticated Assistant API]
    A --> O[Agent Orchestrator / Model Adapter]
    O --> P[Tool Policy: Role, Scope, Budget, Approval]
    P --> T[Allowlisted Typed Tools]
    T --> D[Existing Commerce Domain Services]
    D --> DB[(Prisma / PostgreSQL)]
    D --> Q[Pricing / Delivery / Stock / Idempotency]
    P --> AUD[Audit, Metrics, Evaluation]
    PUB[Anonymous Public MCP] --> RD[Read-only Catalogue Tools]
    RD --> D
    EXT[Future Authenticated MCP] --> P
    AP[Customer or Staff Approval] --> P
~~~

**Boundary rules:**

1. Always derive user identity and staff role **server-side** from a verified session/token. Never trust a model-supplied account ID or an LLM's judgment about authorization.
2. Tool outputs are typed, bounded, and allowlisted. Log minimal audit metadata and redact PII/secrets; define conversation retention and deletion policy before launch.
3. Treat product descriptions, uploaded supplier data, support tickets and model responses as untrusted. Avoid prompt injection by isolating instructions from data and allowing only policy-checked tools.
4. Require explicit human confirmation for live orders, supplier commitments, catalogue publication, refund/price changes and subscription schedule changes. Expire or version proposals; reject stale confirmations.
5. The authoritative checkout service owns LKR arithmetic, discounts, delivery charge, tax configuration, order creation, stock reservation and idempotency. Agents never write directly to order, stock or payment tables.
6. Use request-scoped fast interactions for in-app chat and durable jobs/outbox for follow-up work; do not run an unconstrained, long-lived agent inside serverless HTTP requests.

**Proposed persistence, only when needed:** AgentConversation (owner and retention), AgentProposal (type/status/expiry/version), AgentApproval (actor and one-time approval), AgentToolAudit (safe metadata, no raw PII), and optional AgentEvaluationCase. Consider an outbox for background notifications; do not duplicate authoritative Order or Bag records.

## 5. Security, evaluation and release checklist

Every phase adds automated **unit, API, database-integration and negative authorization tests**. Before enabling a customer-facing write tool, demonstrate:

- Anonymous, banned, customer, supplier and admin access boundaries; no cross-user bag/order access or elevation through tool inputs.
- Prompt-injection attempts in product descriptions, supplier spreadsheets and tool responses cannot alter authorization, call forbidden tools or exfiltrate data.
- Quantity/variant conversions and discounts reconcile to server quotes; race tests cover concurrent bag writes, quote staleness, retry collisions and low stock.
- Draft approvals are single-use or version-claimed, idempotent, and expire; failed requests do not leave partial purchases.
- Model outages, malformed outputs, exhausted budgets and provider timeouts degrade to conventional shopping without blocking the storefront.
- Feature flags allow disabling individual tools/agents without interrupting existing checkout, subscriptions or supplier flows.
- Privacy notices, consent, minimal retention, redacted logs and supplier/customer data boundaries are approved before launch.
- CI remains green: npm run lint; npm run test:unit -- --runInBand; npm run test:checkout-db (with isolated DB); npm run build; HTTP smoke tests.

**Suggested staged rollout:** internal staff → opted-in test customers → limited cohort → wider release, gated on quality/security and measured business value. Start with no autonomous external write actions.

## 6. Measurement and decision gates

Measure against a baseline from ordinary shopping, with opt-in instrumentation and no fabricated benchmarks.

| Metric | What to measure | Release expectation |
| --- | --- | --- |
| Draft-bag acceptance | Share of AI plans customers keep or edit | Improve via observed feedback rather than vanity chat counts |
| Assisted checkout conversion | Drafts that lead to confirmed COD orders | Track cohort difference, refunds and complaints |
| Time to create a useful bag | Median shopping-to-review time | Faster or less effort than current search/browse |
| Grounded price / stock accuracy | Assistant items match fresh server quotes | **100% server-authoritative quote display** before commit |
| Unauthorized or unapproved mutations | Calls rejected/committed without approval | **Zero unauthorized or unapproved orders** |
| Model cost and latency | Cost per useful draft, tool calls, p95 response time | Set budgets/SLAs after pilot measurement |
| Replenishment usefulness | Accepted suggestions vs. dismissed suggestions | Respect customer preference and consent |
| Staff review savings | Time to resolve stock, import and fulfillment exceptions | Track actual staff time, not estimated AI productivity |

**Go/no-go:** Do not scale an agent if quote accuracy, authorization, approval logging or checkout reliability regresses. Ship the conventional store independently of the agent feature.

## 7. Initial implementation backlog (suggested GitHub issues)

| ID | Issue / deliverable | Phase | Acceptance signal |
| --- | --- | --- | --- |
| AG-001 | Security/dependency scan, triage #84 and agent threat model | 0 | Findings prioritized; no blocker left unowned |
| AG-002 | Fix Smart Basket new-item discount price and add tests | 0 | Price matches commercePricing for create **and** update |
| AG-003 | Design variant / quantity contract across bag → quote → order | 0 | Variant selection and units cannot be silently lost |
| AG-004 | Add distributed MCP quotas and production alerts | 0 | Limits work across workers; metrics show errors |
| AG-005 | Introduce model adapter, safe tool registry and evaluations | 1 | Read-only tool eval and injection tests pass |
| AG-006 | Build authenticated assistant UI and catalogue-search tools | 1–2 | Searches only legitimate catalog products |
| AG-007 | Create draft-bag proposal, approval, and fresh quote flow | 2 | Explicit approval and idempotent bag writes |
| AG-008 | Pilot budget-aware shopping with instrumentation | 2 | Tested budget/stock/substitution cases |
| AG-009 | Opt-in replenishment, preference and reminder UX | 3 | No unapproved orders or notifications |
| AG-010 | Meal-plan-to-bag and safe product substitution | 3 | Unit/price/stock/allergen constraints validated |
| AG-011 | Inventory reorder proposals for admins | 4 | Forecast provenance and approval audit |
| AG-012 | Supplier upload/categorization assistant | 4 | No unapproved catalogue publication |
| AG-013 | Authenticated external MCP design and scoped access | 5 | OAuth, tenancy and revocation tests pass |
| AG-014 | B2B draft quote and order-support assistant | 5 | Company/user ownership and escalation verified |

**Suggested first milestone:** AG-001 through AG-003, followed by AG-005 → AG-006 → AG-007 → AG-008. This yields a demonstrable customer benefit while protecting existing checkout.

## 8. Decisions to settle before implementation

- **Product:** Which customer cohort and delivery zones are in the pilot? What constitutes an acceptable substitute and budget tolerance?
- **Commerce:** Are pack sizes separate inventory SKUs? Is checkout confirmation always through the existing UI, and what is the refund/support escalation policy?
- **AI/privacy:** Provider/data residency requirements, customer consent, retention period, evaluation dataset, cost ceiling and model fallback.
- **Operations:** Who approves reorder proposals, supplier import changes, and changes to delivery/recurring scheduling?
- **Delivery:** Confirm staffing, sequencing and acceptance owners. Keep historical vendor-vs-store architecture notes separate from this forward-looking roadmap.

Update this plan with links to implementation issues/PRs and actual evidence as work ships. Do not mark a planned agent as implemented simply because an MCP endpoint, dashboard or AI-related UI label exists.
