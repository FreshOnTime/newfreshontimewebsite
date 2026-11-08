# FreshPick MCP: catalog and customer-delegated shopping

FreshPick exposes a stateless Streamable HTTP MCP server at `/api/mcp` on its storefront deployment. Three public catalog tools and one subscription-plan browsing tool require no login. Customer shopping tools require either a revocable customer agent key or a configured, verified OAuth account link.

## MCP endpoint

`https://freshpick.lk/api/mcp`

Production callers use Streamable HTTP and POST JSON-RPC requests with `Accept: application/json, text/event-stream`. No SSE GET stream or persisted MCP sessions. Public catalog tools remain available to anonymous agents.

## Public tools

| Tool | Action |
| --- | --- |
| `search_products` | Search current catalogue by name, SKU or description |
| `get_product` | Fetch one active product |
| `list_categories` | Browse active grocery categories |
| `list_subscription_plans` | Browse active recurring plans; returns links for customer-only subscription checkout |

## Customer tools (requires customer-issued agent key or linked, scoped OAuth access token)

| Tool | Action |
| --- | --- |
| `list_my_bags` | Read this customer's active bags |
| `get_my_bag` | Read one bag |
| `create_bag` | Create a named bag, optionally with items |
| `add_to_bag` | Add an incremental quantity to a bag |
| `set_bag_item_quantity` | Set absolute quantity, remove at zero |
| `update_bag_details` | Rename or describe a bag |
| `delete_bag` | Soft-delete a bag |
| `get_checkout_handoff` | Revalidate a quote and return a customer checkout link |
| `list_my_wishlist` | Read saved wishlist |
| `add_to_wishlist` | Save a product |
| `remove_from_wishlist` | Remove a saved product |
| `list_my_orders` | View past order summaries, read-only |
| `prepare_reorder_bag` | Prepare a bag from a previous order, with current stock and prices |

No tool submits an order, confirms an address, starts a payment, modifies an existing order or creates a subscription. The customer must personally follow the checkout URL to review their delivery details, confirm the final quote and place the order in the website.

## Granting and revoking agent access

1. Sign into the customer website and visit **Account → AI shopping assistants** at `/profile/agent-access`.
2. Name the agent and create a key. The plaintext key is displayed only once; its SHA-256 hash is kept in Postgres.
3. Configure an MCP client that can set a custom authorization header: `Authorization: Bearer fp_agent_...`. Never paste the key in chat messages or include it in a URL.
4. Revoke access from the account page at any time. Keys expire after 30 days. A customer can have up to five active keys.

## ChatGPT account linking (managed OAuth provider)

An external, standards-compliant OAuth 2.1 / OIDC provider (for example Auth0) is **required**; this application does not issue OAuth tokens. Configure these server-side variables together:

- `MCP_OAUTH_ISSUER`: exact HTTPS OIDC issuer URI (including its trailing slash if present).
- `MCP_OAUTH_RESOURCE=https://freshpick.lk/api/mcp`: must match the API audience issued by the provider.
- `MCP_OAUTH_LINK_CLIENT_ID` and `MCP_OAUTH_LINK_CLIENT_SECRET`: confidential OIDC application for linking signed-in FreshPick customers to their provider identity.
- Allow `https://freshpick.lk/api/profile/mcp-oauth/callback` as an exact redirect URI for the linking application.

In the provider, enable Authorization Code + PKCE S256, its OIDC discovery/JWKS, the OAuth `resource` parameter and API audience binding, and supported ChatGPT client registration (CIMD, DCR or pre-registered client). Configure these API permissions: `catalog:read`, `bags:read`, `bags:write`, `wishlist:read`, `wishlist:write`, `orders:read`. **Do not grant order-placement, payment or subscription-create scopes.**

1. A customer signs into FreshPick and opens `/profile/agent-access`, then selects **Link account** and completes the provider login. Only a verified provider subject is linked; email matching is never used.
2. In ChatGPT, reconnect or refresh the existing FreshPick MCP plugin at `https://freshpick.lk/api/mcp`. Authorize using the external provider's client flow and the exact redirect URI ChatGPT displays.
3. ChatGPT discovers `/.well-known/oauth-protected-resource` and sees customer tools with `oauth2` scope declarations. Unauthenticated tool calls produce `mcp/www_authenticate` challenges. The server validates signed token issuer, audience, expiry, subject and scope before any customer operation.
4. **Disconnect account** on FreshPick removes the provider-to-customer mapping, immediately denying subsequent customer tool calls even if provider tokens have not expired. To fully disconnect, also revoke the OAuth grant with the identity provider.

OAuth account linking and integration are **disabled until the variables are configured**. Legacy bearer keys remain supported. The external provider must complete OAuth consent, refresh and revocation; these are not implemented by this storefront.

See [OpenAI's plugin OAuth authentication guide](https://developers.openai.com/plugins/build/auth) and use an OAuth-capable MCP Inspector to verify the flow before connecting a production customer.

The new agent-key table requires running the included Prisma migration before the updated server can accept customer access: `npx prisma migrate deploy`.

## Example prompts

- "Find tomatoes and bananas, then create a Weekly groceries bag with two of each."
- "Put three more packets of oats in my Weekly groceries bag."
- "Build a fresh bag from my previous order."
- "Show me a breakdown of my groceries and a link to check out myself."

## Security and operating boundaries

- Public tools cannot access user identity or personal state. The customer tools are registered **only** after verifying a customer-issued credential against a hashed token in the database, and checking expiry and account bans.
- Each customer query and mutation is scoped to that credential's user ID, not a user ID supplied by the agent. Browser cookies and standard browser login JWTs do not grant MCP shopping access.
- Item additions and replacements acquire the owning bag row lock, honor stock constraints and apply current sale prices. Bag creation merges product aliases; all totals are server-calculated in LKR.
- The checkout handoff uses the normal server quote calculation but never reserves stock. Prices and availability are checked again by the customer-facing checkout API.
- Product descriptions are untrusted catalogue data, not agent instructions.
- Requests are capped at 64 KiB. Origin and host validation applies; extra production origins go in `MCP_ALLOWED_ORIGINS`. The current 60 req/min/IP limiter is **per warm instance**; deploy a shared rate limiter and monitor key creation and use for high-volume production.
- Credential creation/revocation requires the customer's normal login cookie and a matching same-origin browser request. Keys are never returned by GET after creation.

## Netlify OAuth discovery compatibility

On November 8, 2026 Netlify function logs showed `MODULE_NOT_FOUND` for
`/var/task/.next/server/app/.well-known/oauth-protected-resource/route.js`.
The repository's lockfile pins `@netlify/plugin-nextjs` to 5.13.0, whose
OpenNext bundling excludes dot-prefixed route directories. The upstream fix
landed in 5.13.2. To avoid relying on the adapter version, the public
OAuth metadata URLs now rewrite to the normal packaged Next.js route
`/api/mcp/oauth-resource-metadata`:

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-protected-resource/api/mcp`

Both must return the same OAuth metadata (HTTP 200 when OAuth is
configured, HTTP 404 when intentionally disabled). A successful
`GET /api/mcp` will **not** return tools: this is a stateless MCP server
and intentionally returns HTTP 405 with a JSON-RPC error. To list tools,
POST an MCP JSON-RPC `tools/list` request instead.

After merging, publish a **new Netlify production deploy** and test
both public discovery URLs and POST `/api/mcp`. If an old
`MODULE_NOT_FOUND` error persists, verify the production deploy SHA
and run **Clear cache and deploy**. Do not disclose OAuth secrets in logs.

## Troubleshooting production HTTP 500 after merging the OAuth PR

GitHub Actions checks code and runs local HTTP smoke tests; it does **not**
publish Netlify. In Netlify, check **Deploys → Production deploy** and
**Logs → Functions**, and confirm that the deployed commit contains the
MCP fixes. Check that the production database migrations were applied.

These checks require no customer credentials:

```bash
curl -i https://freshpick.lk/api/mcp
# Expect HTTP 405 with a JSON-RPC error; a generic 500 indicates a deployment/runtime failure.

curl -i -X POST https://freshpick.lk/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
# Expect HTTP 200 and list_subscription_plans among the public tool names.

curl -i https://freshpick.lk/.well-known/oauth-protected-resource
# 200: OAuth configured; 404: OAuth disabled; 503: incomplete/invalid settings.
```

`MCP_OAUTH_ISSUER` and `MCP_OAUTH_RESOURCE` must be full HTTPS
URLs; the resource must end with `/api/mcp` and exactly match the
OAuth provider's access-token audience. All four MCP_OAUTH_* variables
are required to enable OAuth; an incomplete or invalid setup now fails
closed, leaving anonymous browsing usable. Never paste keys or tokens
into chats or GitHub issues.

If production returns a plain HTML 500 even for an anonymous `tools/list`
request, inspect the Netlify function logs at that request's timestamp
for a module initialization error, missing `DATABASE_URL` or a
Prisma initialization failure. The GitHub CI environment does not prove
Netlify's Functions scope has the same runtime environment variables.

## Netlify: public OAuth resource false-positive during secret scanning

Netlify may fail an otherwise successful Next.js build when scanning finds
`MCP_OAUTH_RESOURCE=https://freshpick.lk/api/mcp` in the source and build
artifacts. This value is the **public OAuth audience**, intentionally exposed in
protocol metadata, documentation and code. It is not a credential.

The repository config sets `SECRETS_SCAN_OMIT_KEYS=MCP_OAUTH_RESOURCE` in
`netlify.toml`. Do **not** disable scanning globally. Keep
`MCP_OAUTH_LINK_CLIENT_SECRET`, `JWT_SECRET`, `DATABASE_URL` and all other actual
credentials protected. The OAuth issuer and public client ID are not passwords.

After merging the config, trigger a new production deploy on Netlify and confirm
that secrets scanning finishes successfully. If Netlify reports a *different*
variable, investigate that value independently before adding exceptions.
