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

## Apple-inspired refinement
User requested a stronger Apple-style direction. Referenced the public product hierarchy and short descriptive calls to action on https://www.apple.com/iphone/ and https://www.apple.com/macbook-pro/. Replaced the vintage editorial serif treatments with modern sans-serif display type, centered hero copy above a responsive full-width photo, rounded image cards, quieter white and neutral surfaces, forest-green pill actions, and a split maker feature. Kept FreshPick brand identity and the existing header/footer. Motion is progressive enhancement via IntersectionObserver and native Web Animations, with reduced-motion support and visible default content. No Apple fonts or creative assets copied. Previous Atelier CI and screenshot workflow succeeded; this revision needs a new run and visual inspection.

## Studio motion revision
GSAP 3.13.0 + ScrollTrigger, route-scoped lazy loading, intro timeline, chapter and grid stagger, desktop scroll-scrubbed image parallax. Native scrolling and controls remain intact. Reduced-motion changes revert the animation context and navigation cleanup removes triggers. Three dark-green photographic story chapters replace the prior generic feature. Shared Studio content tokens unify typography, radius, gutters, surfaces and CTA styles across public pages and account/Studio screens. Earlier stylesheet rules are still present for compatibility; further CSS consolidation and individual legacy/admin/ legal page visual audits remain. No new photographs were commissioned. GSAP lock entry uses public published package-lock metadata; npm registry DNS was unavailable locally, so CI must verify installation. Browser tests now check runtime motion activation and a reduced-motion viewport. Final visual quality is not yet established.

## Render-driven directory correction
Reviewed actual desktop screenshots from successful run 45469212966 and the open preview directory, whose live data was empty. Rebuilt the unfiltered launch directory with a photographic masthead, combined search control, honest opening status, three craft links explicitly described as categories (not inventory), maker onboarding and real editorial stories. Filtered no-match states remain compact. Corrected join feature typography and layout. GSAP scroll entrances now use immediateRender:false so offscreen content is not pre-faded; entrance amplitudes reduced. This revision requires a fresh preview and screenshot inspection. No fake maker data added.

## Editorial rebuild (draft)
A page-owned CSS module replaces the home-specific layered layout with a split photographic hero, early real discovery, honest launch state, and a panoramic feature followed by a two-column editorial collection. Shared Studio palette, spacing and radius are revised in the original token declaration; the directory masthead and discovery heading use an editorial display face. Navigation, footer, queries, routes, search, authentication and order/contact workflows are unchanged. The visual review script uses the new stable feature marker. No new assets or invented maker listings; all photography is reused. Other route compositions and legacy CSS cleanup remain follow-up work. This is a draft, not a visually approved release: CI and actual mobile/desktop screenshots must be inspected before merge.

## Cinematic art direction — second draft
Reference research: Apple’s product presentation and motion vocabulary, Flamingo Estate’s brand-led commerce (https://www.situationnormal.co/case-studies/flamingo-estate), and the immersive hospitality case study at https://monarqeg.com/case-studies/khufus/. Interpret their hierarchy and rhythm, not their logos or assets. A full-width cinematic hero, restrained copy, independent search band, indexed borderless discovery rail and unified serif editorial headings bring a stronger identity across public content. Desktop scroll-linked image motion stays non-blocking; no scroll hijack, extra dependency, remote image or paid AI feature. Maker/profile/item/utility pages inherit the shared display styles. Navbar, footer, API and data unchanged. Reuses existing photography; actual screenshots, full per-page polish and CI remain necessary before claiming visual quality or release readiness.
