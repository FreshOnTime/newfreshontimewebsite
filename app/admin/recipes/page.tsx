'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChefHat, Plus, Save, Trash2, Pencil, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";

type AdminProduct = {
  id: string;
  _id?: string;
  name: string;
  sku: string;
  stockQty: number;
};

type IngredientDraft = {
  productId: string;
  quantity: number;
  note: string;
  optional: boolean;
};

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { url: string; alt?: string };
  tags: string[];
  published: boolean;
  publishedAt?: string | null;
  content: {
    version: 1;
    story: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    servings: number;
    cuisine: string;
    dietaryTags: string[];
    ingredients: Array<IngredientDraft & { substitutionProductIds?: string[] }>;
    steps: string[];
  } | null;
};

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  tags: string;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  story: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  dietaryTags: string;
  steps: string;
  ingredients: IngredientDraft[];
};

const emptyDraft: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  imageUrl: "",
  imageAlt: "",
  tags: "",
  published: false,
  metaTitle: "",
  metaDescription: "",
  story: "",
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  servings: 2,
  cuisine: "",
  dietaryTags: "",
  steps: "",
  ingredients: [{ productId: "", quantity: 1, note: "", optional: false }],
};

function commaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function recipeToDraft(recipe: RecipeRow): Draft {
  const content = recipe.content;
  return {
    title: recipe.title,
    slug: recipe.slug,
    excerpt: recipe.excerpt,
    imageUrl: recipe.featuredImage?.url || "",
    imageAlt: recipe.featuredImage?.alt || "",
    tags: recipe.tags.join(", "),
    published: recipe.published,
    metaTitle: "",
    metaDescription: "",
    story: content?.story || "",
    prepTimeMinutes: content?.prepTimeMinutes || 0,
    cookTimeMinutes: content?.cookTimeMinutes || 0,
    servings: content?.servings || 2,
    cuisine: content?.cuisine || "",
    dietaryTags: content?.dietaryTags.join(", ") || "",
    steps: content?.steps.join("\n") || "",
    ingredients: content?.ingredients?.length
      ? content.ingredients.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          note: item.note || "",
          optional: item.optional || false,
        }))
      : [{ productId: "", quantity: 1, note: "", optional: false }],
  };
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recipesResponse, productsResponse] = await Promise.all([
        apiFetch("/api/admin/recipes?limit=100"),
        apiFetch("/api/admin/products?limit=100&archived=false&bundles=all"),
      ]);
      const [recipesJson, productsJson] = await Promise.all([
        recipesResponse.json(),
        productsResponse.json(),
      ]);
      if (!recipesResponse.ok) throw new Error(recipesJson.error || "Failed to load recipes");
      if (!productsResponse.ok) throw new Error(productsJson.error || "Failed to load products");
      setRecipes(Array.isArray(recipesJson.recipes) ? recipesJson.recipes : []);
      setProducts(Array.isArray(productsJson.products) ? productsJson.products : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load recipe studio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id || product._id || "", product])), [products]);

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsEditorOpen(true);
  };

  const openEdit = (recipe: RecipeRow) => {
    setEditingId(recipe.id);
    setDraft(recipeToDraft(recipe));
    setIsEditorOpen(true);
  };

  const updateIngredient = (index: number, patch: Partial<IngredientDraft>) => {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  };

  const removeIngredient = (index: number) => {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const saveRecipe = async () => {
    const ingredients = draft.ingredients.filter((ingredient) => ingredient.productId && ingredient.quantity > 0);
    const steps = draft.steps.split("\n").map((step) => step.trim()).filter(Boolean);
    if (!draft.title.trim() || draft.excerpt.trim().length < 10) {
      toast.error("Add a title and a useful recipe summary.");
      return;
    }
    if (!ingredients.length) {
      toast.error("Every shoppable recipe needs at least one product ingredient.");
      return;
    }
    if (!steps.length) {
      toast.error("Add at least one cooking step.");
      return;
    }

    const payload = {
      title: draft.title.trim(),
      ...(draft.slug.trim() ? { slug: draft.slug.trim() } : {}),
      excerpt: draft.excerpt.trim(),
      ...(draft.imageUrl.trim() ? { featuredImage: { url: draft.imageUrl.trim(), alt: draft.imageAlt.trim() || draft.title.trim() } } : {}),
      tags: commaList(draft.tags),
      published: draft.published,
      metaTitle: draft.metaTitle.trim() || undefined,
      metaDescription: draft.metaDescription.trim() || undefined,
      metaKeywords: commaList(draft.tags),
      content: {
        version: 1 as const,
        story: draft.story.trim(),
        prepTimeMinutes: Number(draft.prepTimeMinutes) || 0,
        cookTimeMinutes: Number(draft.cookTimeMinutes) || 0,
        servings: Math.max(Number(draft.servings) || 1, 1),
        cuisine: draft.cuisine.trim(),
        dietaryTags: commaList(draft.dietaryTags),
        ingredients: ingredients.map((ingredient) => ({ ...ingredient, substitutionProductIds: [] })),
        steps,
      },
    };

    setSaving(true);
    try {
      const response = await apiFetch(editingId ? `/api/admin/recipes/${editingId}` : "/api/admin/recipes", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save recipe");
      toast.success(editingId ? "Recipe updated." : "Recipe created.");
      setIsEditorOpen(false);
      setEditingId(null);
      setDraft(emptyDraft);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecipe = async (recipe: RecipeRow) => {
    if (!window.confirm(`Delete “${recipe.title}”?`)) return;
    try {
      const response = await apiFetch(`/api/admin/recipes/${recipe.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete recipe");
      toast.success("Recipe deleted.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete recipe");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700"><ChefHat className="h-4 w-4" /> FreshPick content commerce</div>
          <h1 className="text-3xl font-bold text-gray-950">Recipe Studio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Publish food stories that are attached to real inventory and can become a customer basket in one action.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> New recipe</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_120px_140px_90px] gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Recipe</span><span>Status</span><span>Commerce</span><span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">Loading recipe studio…</div>
        ) : recipes.length ? recipes.map((recipe) => (
          <div key={recipe.id} className="grid grid-cols-[1fr_120px_140px_90px] items-center gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-950">{recipe.title}</p>
              <p className="mt-1 truncate text-xs text-gray-500">/recipes/{recipe.slug}</p>
            </div>
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${recipe.published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
              {recipe.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{recipe.published ? "Published" : "Draft"}
            </span>
            <span className="text-sm text-gray-600">{recipe.content?.ingredients?.length || 0} products</span>
            <div className="flex justify-end gap-1">
              <button onClick={() => openEdit(recipe)} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700" aria-label={`Edit ${recipe.title}`}><Pencil className="h-4 w-4" /></button>
              <button onClick={() => void deleteRecipe(recipe)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${recipe.title}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        )) : <div className="px-6 py-16 text-center text-sm text-gray-500">No recipes yet. Create the first shoppable food story.</div>}
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm md:p-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-xl md:px-8">
              <div><h2 className="text-xl font-bold text-gray-950">{editingId ? "Edit recipe" : "New recipe"}</h2><p className="mt-1 text-xs text-gray-500">Editorial story + live FreshPick products</p></div>
              <button onClick={() => setIsEditorOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-10 p-6 md:p-8">
              <section className="grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-gray-700">Title</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Sunday roast chicken with market greens" /></label>
                <label><span className="mb-2 block text-sm font-semibold text-gray-700">Slug</span><input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Generated automatically if empty" /></label>
                <label><span className="mb-2 block text-sm font-semibold text-gray-700">Cuisine</span><input value={draft.cuisine} onChange={(e) => setDraft({ ...draft, cuisine: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Sri Lankan, Italian, Japanese…" /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-gray-700">Short summary</span><textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="min-h-24 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-gray-700">Editorial story</span><textarea value={draft.story} onChange={(e) => setDraft({ ...draft, story: e.target.value })} className="min-h-36 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Why this dish belongs on the table…" /></label>
                <label><span className="mb-2 block text-sm font-semibold text-gray-700">Hero image URL</span><input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" /></label>
                <label><span className="mb-2 block text-sm font-semibold text-gray-700">Image alt text</span><input value={draft.imageAlt} onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" /></label>
                <label><span className="mb-2 block text-sm font-semibold text-gray-700">Tags</span><input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="weeknight, seasonal, premium" /></label>
                <label><span className="mb-2 block text-sm font-semibold text-gray-700">Dietary tags</span><input value={draft.dietaryTags} onChange={(e) => setDraft({ ...draft, dietaryTags: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="high-protein, vegetarian" /></label>
                <div className="grid grid-cols-3 gap-3 md:col-span-2">
                  <label><span className="mb-2 block text-xs font-semibold text-gray-600">Prep min</span><input type="number" min={0} value={draft.prepTimeMinutes} onChange={(e) => setDraft({ ...draft, prepTimeMinutes: Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-3 py-3" /></label>
                  <label><span className="mb-2 block text-xs font-semibold text-gray-600">Cook min</span><input type="number" min={0} value={draft.cookTimeMinutes} onChange={(e) => setDraft({ ...draft, cookTimeMinutes: Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-3 py-3" /></label>
                  <label><span className="mb-2 block text-xs font-semibold text-gray-600">Servings</span><input type="number" min={1} value={draft.servings} onChange={(e) => setDraft({ ...draft, servings: Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-3 py-3" /></label>
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold text-gray-950">Shoppable ingredients</h3><p className="mt-1 text-xs text-gray-500">Attach real catalogue items. Stock and price remain live.</p></div><button onClick={() => setDraft((current) => ({ ...current, ingredients: [...current.ingredients, { productId: "", quantity: 1, note: "", optional: false }] }))} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:border-emerald-300 hover:text-emerald-700"><Plus className="h-3.5 w-3.5" /> Ingredient</button></div>
                <div className="space-y-3">
                  {draft.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[minmax(0,1fr)_90px_minmax(0,.7fr)_90px_40px] md:items-center">
                      <select value={ingredient.productId} onChange={(e) => updateIngredient(index, { productId: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm"><option value="">Select a FreshPick product</option>{products.map((product) => <option key={product.id || product._id} value={product.id || product._id}>{product.name} · {product.sku} · stock {product.stockQty}</option>)}</select>
                      <input type="number" min={1} value={ingredient.quantity} onChange={(e) => updateIngredient(index, { quantity: Math.max(Number(e.target.value) || 1, 1) })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm" aria-label="Quantity" />
                      <input value={ingredient.note} onChange={(e) => updateIngredient(index, { note: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm" placeholder="e.g. finely sliced" />
                      <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={ingredient.optional} onChange={(e) => updateIngredient(index, { optional: e.target.checked })} /> Optional</label>
                      <button onClick={() => removeIngredient(index)} disabled={draft.ingredients.length === 1} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </section>

              <section><label><span className="mb-2 block text-sm font-semibold text-gray-700">Cooking steps — one step per line</span><textarea value={draft.steps} onChange={(e) => setDraft({ ...draft, steps: e.target.value })} className="min-h-48 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder={"Heat the pan over medium heat.\nSeason the chicken generously.\nCook until golden and finish with herbs."} /></label></section>

              <section className="grid gap-5 md:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold text-gray-700">SEO title</span><input value={draft.metaTitle} onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label><label><span className="mb-2 block text-sm font-semibold text-gray-700">SEO description</span><input value={draft.metaDescription} onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label></section>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="h-4 w-4" /> Publish immediately</label>
                <div className="flex gap-3"><button onClick={() => setIsEditorOpen(false)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">Cancel</button><button onClick={() => void saveRecipe()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save recipe"}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
