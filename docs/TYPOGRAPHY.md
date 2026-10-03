# FreshPick typography

FreshPick uses the Arial-based font stack from before the latest typography
update throughout the site. The current ivory, green and amber palette remains
unchanged, including the green/clay navbar wordmark.

| Role | Font and treatment |
| --- | --- |
| Hero and public page introductions | Arial-based stack, sentence case, responsive sizes and balanced lines |
| Public section headings | Same stack, 36px on mobile / 48px on desktop, 1.12 line height |
| Journal story titles | Same stack, 24px / 30px, 1.2 line height |
| Product and category names | Same stack, medium weight, sentence case |
| Navigation, forms, buttons and dashboards | Same stack, clear sizes and medium action weights |
| Prices | Same stack with tabular numerals |
| Editorial labels | Same stack, small uppercase labels with 0.12em tracking |
| Article body | Same stack, readable column up to 68ch and 1.8 paragraph line height |

The shared `--font-sans` token is Arial, Helvetica Neue, ui-sans-serif,
system-ui and sans-serif. `--font-heading` aliases it so existing `font-heading`
and `font-serif` components use the same family. `--font-default` and
`--font-accent` also resolve to this stack. Tailwind aliases live in
`tailwind.config.ts`; font definitions live in `app/globals.css`.

No downloadable font files, font preloads or font-provider requests are needed.
The browser uses the first installed font in the stack. Keep text sizes,
weights, spacing and colour roles independent of the font family.

The footer keeps its newsletter, navigation, contact information, large brand
name and policies. The separate cream logo badge has been removed.

When changing typography, check public headlines, long category/product names,
article text, navigation, sign-in/signup forms and admin dialogs at 320, 390,
820 and 1440px. Confirm the computed font family, keyboard interactions,
overflow and form input sizes.
