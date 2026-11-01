# FreshPick full-bleed branded homepage hero

The homepage uses one dominant full-width food-market photograph, an overlaid FreshPick brand mark, and readable, server-rendered campaign typography. It is an original FreshPick execution of an editorial market look, not a copied Natoora photo or layout.

## Photograph and credit

- Image: `https://images.unsplash.com/photo-1595275522477-c3ce3ca9714b`
- Photographer: Gorrin Bel (@gorrinbel)
- Source: https://unsplash.com/photos/bread-beside-glass-jar-with-milk-1kDKct0-Wgo
- License: https://unsplash.com/license
- The image is illustrative; not actual published products or supplier assets.
- Next/Image optimizes the remote image through the already configured `images.unsplash.com` remote pattern.

## Brand treatment

- The photographed food and product assortment is the focal point. On top is a fully editable brand block using `components/brand/Wordmark.tsx`, plus the campaign text `A whole market. For every table.`
- Photo and FreshPick SVG wordmark are separate layers. The FreshPick logo is **overlaid on the image**, not physically printed on a grocery bag.
- A left-to-right and bottom gradient ensure cream/white text legibility. Static composition prevents carousel CLS and unnecessary JavaScript.
- Mobile image crop uses the photograph focal point; the logo badge is hidden at small widths to avoid competing with the headline.
- No claims of same-day shipping, supplier payouts, certified organic status or card payments.

## Functional links

- Primary CTA: `/products`
- Secondary CTA: `/how-it-works`
- Lower tertiary link: `/categories`

## Visual QA before release

At 320, 375, 390, 768, 1024 and 1440px, review heading line wrapping, dark overlay contrast, background cropping, nav-over-hero spacing, footer-of-hero category link, and image load behavior. Test keyboard tab order and reduced-motion preferences. Run CI lint, tests, production build and deployed-browser smoke checks.
