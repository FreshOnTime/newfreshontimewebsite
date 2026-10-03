# FreshPick identity

The lowercase FreshPick wordmark and leaf are original artwork, inspired by the
friendly, organic lettering in the supplied FreshDirect reference. No reference
logo artwork is copied or embedded. Fresh uses leaf green `#61B547`; Pick uses
tangerine `#F4971A`. The compact f/p mark is used for browser and app icons.

Letter outlines were derived from Acme Regular by Juan Pablo del Peral, licensed
under the SIL Open Font License 1.1. The license is included in `ACME-OFL.txt`.
The font is used as a design source; there is no runtime font download or bundled
font binary. Body and page typography retain the existing Arial stack.

Source: https://github.com/google/fonts/blob/main/ofl/acme/Acme-Regular.ttf

Source SHA-256: `76fdb582f54653c27274d5cd986f994c28d7fa7d323e7eb9ee14ce8875d39dc4`

To regenerate the SVG and shared React artwork, install fonttools and run:

```sh
python scripts/generate-brand-wordmark.py /path/to/Acme-Regular.ttf
```

The SVG paths keep the lettering consistent across devices. PNG app icons and
the ICO favicon are raster exports of `freshpick-mark.svg`.
