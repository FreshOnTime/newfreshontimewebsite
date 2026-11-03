import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("FreshPick product-detail visual and interaction regression", () => {
  it("shows a square gallery with a product-specific photo fallback", () => {
    const page = source("app/products/[id]/page.tsx");
    const photo = source("components/products/ProductImage.tsx");

    expect(page).toContain("aspect-square");
    expect(page).toContain('variant="detail"');
    expect(page).not.toContain("aspect-[4/5]");
    expect(photo).toContain('normalizedSrc !== FALLBACK_IMAGE');
    expect(photo).toContain('onError={() => setFailedSrc(normalizedSrc)}');
    expect(photo).toContain('role="img"');
    expect(photo).toContain("Photo coming soon");
    expect(photo).toContain("needsUnoptimizedImage(normalizedSrc)");
    expect(photo).not.toContain('src="/placeholder.svg"');
  });

  it("does not squeeze the quantity entry between fixed-width buttons", () => {
    const large = source("components/quanity-input/QuantityInputLarge.tsx");
    const base = source("components/quanity-input/QuantityInputBase.tsx");
    const controls = source("app/products/[id]/ProductControls.tsx");

    expect(large).toContain("w-full min-w-0");
    expect(large).not.toContain("max-w-44");
    expect(large).not.toContain("space-x-3");
    expect(base).toContain('aria-label="Quantity"');
    expect(base).toContain("w-11 shrink-0");
    expect(base).toContain("min-w-0 w-full");
    expect(base).toContain("setQuantity(value)");
    expect(controls).toContain("sm:grid-cols-[190px_minmax(0,1fr)]");
    expect(controls).toContain('className="h-12 w-full"');
  });

  it("hides the bag switcher for signed-out shoppers and blocks invalid quantities", () => {
    const button = source("app/products/[id]/AddToBagButton.tsx");

    expect(button).toContain('Sign in to add to bag');
    expect(button).toContain("const canChooseBag = Boolean(user) && !authLoading && !product.isOutOfStock");
    expect(button).toContain("{canChooseBag && (");
    expect(button).toContain("Number.isSafeInteger(quantity)");
    expect(button).toContain('aria-label="Choose shopping bag"');
    expect(button).toContain("createBag(newBagName, newBagDescription, addAfterCreate");
    expect(button).toContain("await addToBag(selectedBagId, product, quantity)");
    expect(button).toContain("router.push(`/auth/login?redirect=");
    expect(button).not.toContain("bg-brand-amber px-4");
  });

  it("continues displaying stored product prices rather than inventing a replacement", () => {
    const page = source("app/products/[id]/page.tsx");
    const controls = source("app/products/[id]/ProductControls.tsx");
    expect(page).toContain("discountedUnitPrice(product.pricePerBaseQuantity");
    expect(controls).toContain("calculateItemTotal(derivedProduct, validQuantity)");
    expect(controls).toContain('toLocaleString("en-LK"');
  });
});
