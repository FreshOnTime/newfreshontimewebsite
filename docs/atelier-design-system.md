# FreshPick Atelier — design system and acceptance review

## Intent
Create a premium independent food discovery platform, not a generic grocery storefront. Keep the current navbar, footer, logo, routes and business logic intact. No production data or authentication changes.

## Reference principles
- [Aesop](https://www.aesop.com/): restrained palette, product and editorial storytelling, measured copy.
- [Flamingo Estate](https://flamingoestate.com/): sensory photography, dramatic tonal contrast, food and garden context.
- [Noma Projects](https://gretelny.com/noma-projects): minimal modular identity, functional ingredient information.
- [Apple motion](https://developer.apple.com/design/human-interface-guidelines/motion): purposeful, interruptible movement and reduced-motion settings.
- Vercel React best practices: parallel data fetching, server-rendered content, small client interaction components, cleanup for listeners, no new animation dependency.

This is an original interpretation, not a clone. References were reviewed from public web content, not a pixel-by-pixel browser audit. Existing FreshPick image assets are reused; no new third-party imagery copied. No fictional makers, inventory or reviews in public data.

## System
Atelier uses existing cream and forest-green brand tones, warm neutral contrast, editorial serif headings, clear sans-serif utility text, photographic hero, native scroll-snap gallery with keyboard access and arrow controls, visible focus indicators, native details disclosures, and reduced-motion-aware microinteractions. The public header/footer are outside the content-scoped styles.

## Page coverage
Home, directory, maker storefront, item, maker story, editorial story/index, saved picks, about, how it works, help, join, contact via shared PageBand, auth frame, account pages via AccountPage, dashboard and Maker Studio. Legacy redirected commerce pages and internal admin screens retain their existing workflows and are not individually redesigned. Legal and archive pages inherit applicable shared tokens; their full individual visual audit remains to be done.

## Acceptance
- Build, lint, unit/API tests, database and HTTP smoke tests must pass.
- Render 390 and 1440 widths; capture actual screenshots. Check mobile menu and original header/footer.
- Validate discovery carousel arrows, search, category filters, item disclosure, published related items, maker/contact and account workflows.
- Review actual photo crops, contrast, focus, overflow, empty and populated states. Check additional viewport widths and accessibility manually before release.
- CI captures the expanded primary public and authentication route list plus authenticated Maker Studio using isolated fixtures. Screenshot review is not yet completed.
