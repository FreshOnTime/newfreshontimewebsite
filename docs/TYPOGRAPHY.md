# FreshPick typography

FreshPick pairs Newsreader's editorial headings with DM Sans for shopping and
account interfaces. The ivory, green and amber palette remains unchanged.

| Role | Font and treatment |
| --- | --- |
| Hero and public page introductions | Newsreader, regular weight, sentence case, responsive size and balanced lines |
| Public section headings | Newsreader, 36px on mobile / 48px on desktop, 1.12 line height |
| Journal story titles | Newsreader, 24px / 30px, 1.2 line height |
| Product and category names | DM Sans, medium weight, sentence case |
| Navigation, forms, buttons and operational dashboards | DM Sans; medium weights for actions and clear text sizes |
| Prices | DM Sans with tabular numerals |
| Editorial labels | DM Sans, small uppercase labels with 0.12em tracking |
| Article body | DM Sans, readable column up to 68ch and 1.8 paragraph line height |

Use `font-sans` for interface elements, `font-heading` or `font-serif` for
editorial text, `editorial-title` for public section headings, and
`market-story-title` for story cards. Avoid applying uppercase or heavy weights
to whole titles, product names and navigation. Uppercase remains available for
small labels and section markers. Preserve the green/clay wordmark treatment.

The storefront scope (`freshpick-market`) applies editorial h1/h2 styles;
explicit `font-sans` headings can opt into interface typography. Outside this
scope, dashboard headings use DM Sans. Authentication pages share the editorial
heading style while form labels and inputs remain in DM Sans.

Fonts are initialized once in the root layout. The shared tokens live in
`app/globals.css`, with Tailwind aliases in `tailwind.config.ts`. See
[font provenance and licenses](../app/fonts/README.md). No font CDN dependency
or new runtime package is required.

When changing typography, check public headlines, long category/product names,
article text, navigation, sign-in/signup forms and admin dialogs at 320, 390,
820 and 1440px. Check actual font loading, keyboard interactions, overflow and
form input sizes; screenshots alone do not prove that the intended font loaded.
