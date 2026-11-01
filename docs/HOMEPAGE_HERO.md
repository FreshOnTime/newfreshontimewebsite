# Homepage hero direction

The FreshPick homepage uses a **simple premium editorial hero**, not a slideshow or a category collage. The message is `A whole market. For every table.` with two real links: the existing products catalogue and How FreshPick Works.

## Photography

- Photo URL: `https://images.unsplash.com/photo-1595275522477-c3ce3ca9714b`
- Photographer: Gorrin Bel (@gorrinbel)
- Source: https://unsplash.com/photos/bread-beside-glass-jar-with-milk-1kDKct0-Wgo
- License: https://unsplash.com/license (free photo; non-Unsplash+ at time of implementation)
- Content: bread, eggs, milk, fruit and groceries; represents the broader offering, not actual FreshPick inventory.
- Image is currently served remotely via the existing `images.unsplash.com` Next.js optimizer allowlist, not stored in this repository. If self-hosting is later required, download and optimize the licensed image to `public/images/home/` before changing the `MARKET_HERO_PHOTO` constant.

## Content and behavior

- The hero is server rendered, with a single priority image, descriptive alt text and responsive Next Image sizes.
- Primary action `/products` and secondary action `/how-it-works` are real routes.
- No autoplay, carousel indicators, split-photo collage, false delivery windows, fabricated inventory or price claims.
- Do not add recurring-card-billing promises. Checkout is currently cash on delivery.
- Review 320, 375, 768, 1024 and 1440 px, including the image's focal point and first-page scroll depth, before merge.
