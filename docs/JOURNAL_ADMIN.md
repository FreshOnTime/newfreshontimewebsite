# Homepage journal and focused administration

> Current carousel, navigation and recipe scope: [Editorial market](EDITORIAL_MARKET.md). The earlier implementation notes below are historical.

Updated 2026-10-05, on top of the merged Natoora-inspired UI revision.

## Journal

- The homepage shows the three latest published journal entries, with real uploaded photography, publication dates, excerpts and article links. A neutral editorial photo fills missing artwork; it does not imply a particular producer or origin.
- Journal is available in the main desktop/mobile navigation. The homepage section always provides an entry point to `/blog`, including when there are no posts.
- Public lists, article pages and the homepage exclude drafts, deleted entries and the reserved recipe/collection records. Uncategorized journal entries are supported.
- The journal editor accepts ordinary stories and drafts; recipes and collections use their dedicated editors. Publishing, editing, renaming, unpublishing or deleting a story invalidates the homepage journal cache and affected article paths.
- The four repository-backed grocery guides introduced on 2026-10-04 are imported into the database-backed CMS on the first authenticated visit to /admin/blogs. Existing slugs are never duplicated, including deleted records, so CRUD state remains authoritative after import.
- The editor includes write/preview formatting controls and image insertion. Featured images and inline article images upload through the protected blog image endpoint into the dedicated blog-images storage area rather than requiring administrators to paste image URLs.
- Journal search cancels superseded requests; an outage has a retry state distinct from an empty result.

## Administration

The primary sidebar now has 12 links organised around working tasks:

| Group | Tools |
| --- | --- |
| Store | Overview, Orders, Products, Categories, Customers, Subscriptions, Suppliers |
| Publishing | Journal, Recipes, Collections |
| Business | Business enquiries, Reports |

User access, the activity log, profile and notification sending live in the account menu. Supplier-upload review is linked from Suppliers. The experimental Intelligence entry and the nonfunctional global search are removed from the main admin chrome. Existing data, APIs and retained workflows are not deleted.

The active page has one selected navigation item; Overview is selected only at `/admin`. The mobile navigation uses an accessible dialog with Escape, focus return, route-close and desktop-resize behavior. Public footer/banner typography also fits narrow phones.

## Verification scope

Production build and TypeScript checking passed, targeted lint reported no warnings or errors, and all 143 tests across 19 suites passed. Browser verification passed 19 route/viewport checks across 320–1440 px, plus eight interaction flows, with no page errors. Browser checks use isolated local story and admin fixtures, covering public journal layouts, search/retry, navigation, protected admin access and publication/unpublication through the actual authenticated routes and homepage caches. No production article, customer record, notification or payment is created by verification.

Screenshots show clearly identified local sample articles. Actual published content remains managed through `/admin/blogs`.
