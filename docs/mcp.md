# FreshPick MCP

The public, read-only MCP endpoint is `/api/mcp` on the same deployment as the storefront. It uses the official MCP TypeScript SDK and stateless Streamable HTTP with JSON responses, so Netlify workers do not need sticky sessions.

## Connect after deployment

Use your deployed website's HTTPS origin followed by `/api/mcp`, for example `https://freshpicknew.netlify.app/api/mcp` or `https://freshpick.lk/api/mcp` once that domain's HTTPS certificate is working. This endpoint becomes available when this branch is deployed; adding code does not connect your ChatGPT account automatically.

For a client that supports remote MCP servers:

```json
{
  "mcpServers": {
    "freshpick": {
      "url": "https://freshpicknew.netlify.app/api/mcp"
    }
  }
}
```

Select Streamable HTTP and no authentication. Use the client's configuration format if it differs from this example. A local dev endpoint is `http://localhost:3000/api/mcp`.

## Tools

| Tool | Arguments | Result |
| --- | --- | --- |
| `search_products` | `query`, optional `categorySlug`, `inStockOnly`, `page` (1–100), `limit` (1–20) | Public, non-archived products with LKR prices, availability and storefront paths |
| `get_product` | `sku` | A public product's description, price and availability |
| `list_categories` | None | Active category slugs and storefront paths |

Example prompts: “Find tomatoes in stock on FreshPick”; “Show FreshPick's grocery categories”; “Find pantry products on FreshPick.” Prices and availability may change; confirm on the storefront before purchasing.

## Transport and data boundaries

- Clients initialize normally, then POST JSON-RPC messages with `Accept: application/json, text/event-stream`. Responses use JSON. Initialized notifications return HTTP 202.
- GET and DELETE return HTTP 405; standalone SSE and stored sessions are not offered.
- Tools cannot access customer accounts, bags, orders, payment information, admin fields or write operations. Product descriptions are untrusted data, not instructions.
- Queries and page sizes are bounded. Request bodies are limited to 64 KiB. Database failures return a generic tool error instead of connection details.
- Host and Origin validation permits the FreshPick domains, configured Netlify deployment URLs, and `NEXT_PUBLIC_SITE_URL`. Localhost is permitted during development only. Browser clients or additional production origins must be explicitly added to the comma-separated `MCP_ALLOWED_ORIGINS` environment variable.
- A dedicated in-memory quota limits a client to 60 requests per minute **per warm worker**. It is not a deployment-wide rate limit; use hosting-level or shared rate limiting if traffic requires a global quota.
- The public tools require no API key. Customer-specific or purchase tools would require a separate authenticated authorization design.

No MCP details are shown in the customer shopping interface.
