# FreshPick publication system

The previous stylesheet combined luxury, studio and discovery systems; older high-specificity rules forced bold Arial on some headings while others were serif. The discovery stylesheet is replaced with a canonical publication token set and an explicitly scoped bridge for existing public components. Admin, account and authentication content are excluded from the bridge.

References: the supplied Noma editorial spread; https://noma.dk/ (food narrative and photography), https://www.saveur.com/ (editorial hierarchy), https://www.theinfatuation.com/ (decision-oriented discovery), https://anthonymicallef.ca/projects/antonios-restaurant (Figma-based content-first identity), https://www.odama.io/ (Secondz curated food discovery design system). Public page and case-study text was reviewed; Figma Community blocked automated access and no private design file was available. No copied third-party design or new third-party imagery.

Tokens: existing Instrument Serif font at 400 for editorial titles; system sans for UI; neutral paper, deep green, existing amber accent; 1320px content grid; 44px+ primary controls; restrained rules and 3–4px radii. No false popularity indicators or fictional businesses. Imagery is existing editorial imagery, not photographs of named imported businesses.

Templates: asymmetrical homepage lead story, compact searchable discovery with pagination of all search groups and real product cards, filterable journal, readable article, independent business detail, two-path business onboarding, food calculators, shared supporting-page masthead. Existing maker publishing, save, contact, authentication and admin flows retained. Public pages using legacy shared components inherit publication tokens; this is not an individual rewrite of every historical or redirected route.

Data: P2021 in the earlier preview was a missing discovery_prospects table. No database credentials or production schema changes are made here. Apply the existing migration and seed to the appropriate database, then review prospects. Do not approve solely to fill a design.

Verification: visual workflow adds 768px, extra article routes, image checks, one-heading checks on core pages, computed serif check and overflow tests. These are checks to execute, not proof of visual quality. Human screenshot review of the actual preview is required.
