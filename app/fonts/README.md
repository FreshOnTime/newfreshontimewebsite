# FreshPick fonts

The application bundles DM Sans for interface text and Newsreader for editorial
headings. Both are supplied under the SIL Open Font License 1.1; the complete
copyright and license notices are included alongside the font files.

Sources downloaded from the official Google Fonts repository:

- DM Sans: https://github.com/google/fonts/tree/main/ofl/dmsans
- Newsreader: https://github.com/google/fonts/tree/main/ofl/newsreader

The source variable TTF files were converted to WOFF2 with FontTools, preserving
weight and optical-size axes. Bundled character ranges are U+0000–024F,
U+2000–206F and U+20A0–20CF, plus U+2122 and U+2212. Characters outside those
ranges use the system fallback stack, including Sinhala and Tamil text.

Source TTF SHA-256 checksums:

```text
DMSans[opsz,wght].ttf
8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d

Newsreader[opsz,wght].ttf
8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1
```

Initialize these files only in `app/layout.tsx` through `next/font/local`. They
are served as versioned Next.js assets, with preloading, metric-adjusted fallbacks
and `display: swap`. Builds and visitors do not need to contact a font provider.
