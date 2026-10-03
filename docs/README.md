# FreshPick documentation

This is the documentation for the application implemented in this repository. Reviewed on **3 October 2026**, against main commit `218a933b31ce7705dd375a8fd7281968f99ffc4c`. It describes source behavior; it is not certification that a deployed site's environment, supplier data, payments or scheduled workers have been verified.

## Start here

| Reader | Guide | What it covers |
| --- | --- | --- |
| Owner or product team | [Features](FEATURES.md) | Customer journeys, suppliers, publishing, integrations and limitations |
| Store administrator | [Admin panel handbook](ADMIN_GUIDE.md) | Every main and secondary admin page, controls, workflows and troubleshooting |
| Basket operator or developer | [Subscriptions](SUBSCRIPTIONS.md) | Plans, recurring baskets, stock, scheduling, delivery queue and separate recurring orders |
| Developer | [Developer guide](DEVELOPER_GUIDE.md) | Local setup, configuration, scripts, testing and first administrator |
| Developer | [Architecture](ARCHITECTURE.md) | Data model, transactions, authentication and integration boundaries |
| Integration developer | [API reference](API_REFERENCE.md) | Route and HTTP method inventory, request examples and access rules |
| Maintainer | [Function reference](FUNCTION_REFERENCE.md) | All domain-service methods, critical helpers and admin action implementation map |
| Production operator | [Operations runbook](OPERATIONS.md) | Backups, deployment, storage, outbox, cron and recovery |
| Release owner | [Platform readiness](PLATFORM_READINESS.md) | Deployment evidence to gather and outstanding production requirements |
| MCP client integrator | [MCP](mcp.md) | Read-only product/category tools and transport configuration |

## Reading paths

- **Run the market:** Admin handbook → Subscriptions → Operations. Begin with the handbook's daily checklist.
- **Change the application:** Developer guide → Architecture → relevant function/API entries → tests and operations.
- **Decide what to launch:** Features → subscription mode comparison → readiness gaps. Do not infer a payment gateway, campaign sender or permissions system from a form label alone.

The API inventory covers every `app/api/**/route.ts` handler at the reviewed revision. The function reference covers domain services and important shared functions, rather than enumerating every React render component. The admin handbook documents all 21 admin page routes, including tools retained outside the main sidebar.

## Existing change notes

These explain individual changes and design decisions. Some describe an earlier design or naming scheme; consult the guides above for the current functional overview.

| Note | Topic |
| --- | --- |
| [Enquiry inbox](ENQUIRY_INBOX.md) | Contact intake and admin triage |
| [Blog administration](JOURNAL_ADMIN.md) | Editorial publishing implementation; the storefront now calls this Blog |
| [Account flows](ACCOUNT_DESIGN_AND_FLOW_FIXES.md) | Authentication and profile improvements |
| [Category-first market](CATEGORY_FIRST_MARKET.md) | Navigation and vendor positioning |
| [Discovery](DISCOVERY_IMPROVEMENTS.md) | Search, recommendations and category navigation |
| [Editorial market](EDITORIAL_MARKET.md) | Editorial storefront structure |
| [Editorial revamp](EDITORIAL_REVAMP.md) | Earlier visual revision |
| [Natoora-inspired UI](NATOORA_UI.md) | Reference direction and original asset approach |
| [Typography](TYPOGRAPHY.md) | Earlier typography change notes |
| [Fresh market banner](FRESH_MARKET_BANNER.md) | Banner asset development |

## Keeping documentation current

When changing a feature, update its operator instructions, API contract and source map together. Changing a route requires updating the API inventory; changing a sidebar or retained admin page requires updating the admin route map. Keep examples free of real customer data, passwords and deployment secrets. Record deployed verification separately from implementation claims.
