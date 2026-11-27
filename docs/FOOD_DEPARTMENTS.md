# Food discovery departments

Dedicated discovery URLs use approved profiles and published offerings, rather than duplicate databases or fictional listings.

- Sri Lanka is the default country-wide search scope; it is normalized to no town filter. Specific towns remain searchable.
- Nine public department URLs reuse the same approved owner and reviewed listing queries. Their fixed classification cannot be changed by a query parameter. The website pages CMS can edit each department's headline, introduction and SEO fields independently.
- Food & Culture CMS continues to manage dish descriptions, aliases, variations, tradition stories, sources and related dishes. Tradition highlights reuse the variations array. Markdown is rendered with raw HTML and inline images disabled. Dedicated editorial photo upload is not included in this release.
- No migration is required. PR #179's existing branding migration remains a separate production release prerequisite.
- Contact page is untouched. Public filters remain native selects; the shared taxonomy form gets a consistent responsive grid. Test at 320, 390, 430, 768 and 1440 CSS pixels.
