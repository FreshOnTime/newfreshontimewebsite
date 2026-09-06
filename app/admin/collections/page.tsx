'use client';

import { useCallback, useEffect, useState } from "react";
import { Layers3, Plus, Save, Trash2, Pencil, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";

type RecipeOption = { id: string; title: string; slug: string; published: boolean };
type ProductOption = { id: string; _id?: string; name: string; sku: string; stockQty: number };
type CollectionRow = {
  id: string; title: string; slug: string; excerpt: string; published: boolean;
  featuredImage?: { url: string; alt?: string };
  tags: string[];
  metaTitle?: string; metaDescription?: string;
  content: { version: 1; eyebrow: string; story: string; occasion: string; themeTags: string[]; recipeSlugs: string[]; productIds: string[] } | null;
};
type Draft = {
  title: string; slug: string; excerpt: string; imageUrl: string; imageAlt: string; tags: string;
  published: boolean; metaTitle: string; metaDescription: string; eyebrow: string; story: string;
  occasion: string; themeTags: string; recipeSlugs: string[]; productIds: string[];
};

const emptyDraft: Draft = {
  title: "", slug: "", excerpt: "", imageUrl: "", imageAlt: "", tags: "", published: false,
  metaTitle: "", metaDescription: "", eyebrow: "FreshPick edit", story: "", occasion: "", themeTags: "",
  recipeSlugs: [], productIds: [],
};

const commaList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

function toDraft(item: CollectionRow): Draft {
  return {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    imageUrl: item.featuredImage?.url || "",
    imageAlt: item.featuredImage?.alt || "",
    tags: item.tags.join(", "),
    published: item.published,
    metaTitle: item.metaTitle || "",
    metaDescription: item.metaDescription || "",
    eyebrow: item.content?.eyebrow || "FreshPick edit",
    story: item.content?.story || "",
    occasion: item.content?.occasion || "",
    themeTags: item.content?.themeTags.join(", ") || "",
    recipeSlugs: item.content?.recipeSlugs || [],
    productIds: item.content?.productIds || [],
  };
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [collectionRes, recipeRes, productRes] = await Promise.all([
        apiFetch("/api/admin/collections?limit=100"),
        apiFetch("/api/admin/recipes?limit=100"),
        apiFetch("/api/admin/products?limit=100&archived=false&bundles=all"),
      ]);
      const [collectionJson, recipeJson, productJson] = await Promise.all([collectionRes.json(), recipeRes.json(), productRes.json()]);
      if (!collectionRes.ok) throw new Error(collectionJson.error || "Failed to load collections");
      if (!recipeRes.ok) throw new Error(recipeJson.error || "Failed to load recipes");
      if (!productRes.ok) throw new Error(productJson.error || "Failed to load products");
      setCollections(Array.isArray(collectionJson.collections) ? collectionJson.collections : []);
      setRecipes(Array.isArray(recipeJson.recipes) ? recipeJson.recipes : []);
      setProducts(Array.isArray(productJson.products) ? productJson.products : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load collection studio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleRecipe = (slug: string) => setDraft((current) => ({ ...current, recipeSlugs: current.recipeSlugs.includes(slug) ? current.recipeSlugs.filter((item) => item !== slug) : [...current.recipeSlugs, slug] }));
  const toggleProduct = (id: string) => setDraft((current) => ({ ...current, productIds: current.productIds.includes(id) ? current.productIds.filter((item) => item !== id) : [...current.productIds, id] }));

  const save = async () => {
    if (!draft.title.trim() || draft.excerpt.trim().length < 10) return toast.error("Add a title and useful summary.");
    if (!draft.recipeSlugs.length && !draft.productIds.length) return toast.error("Choose at least one recipe or product.");
    setSaving(true);
    try {
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
          eyebrow: draft.eyebrow.trim() || "FreshPick edit",
          story: draft.story.trim(),
          occasion: draft.occasion.trim(),
          themeTags: commaList(draft.themeTags),
          recipeSlugs: draft.recipeSlugs,
          productIds: draft.productIds,
        },
      };
      const response = await apiFetch(editingId ? `/api/admin/collections/${editingId}` : "/api/admin/collections", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save collection");
      toast.success(editingId ? "Collection updated." : "Collection created.");
      setOpen(false); setEditingId(null); setDraft(emptyDraft); await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save collection");
    } finally { setSaving(false); }
  };

  const remove = async (item: CollectionRow) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    try {
      const response = await apiFetch(`/api/admin/collections/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete collection");
      toast.success("Collection deleted."); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete collection"); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700"><Layers3 className="h-4 w-4" /> FreshPick merchandising</div><h1 className="text-3xl font-bold text-gray-950">Collection Studio</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Build premium occasion-led edits from published recipes and live catalogue products.</p></div>
        <button onClick={() => { setEditingId(null); setDraft(emptyDraft); setOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> New collection</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? <div className="px-6 py-16 text-center text-sm text-gray-500">Loading collections…</div> : collections.length ? collections.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_120px_150px_90px] items-center gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0">
            <div className="min-w-0"><p className="truncate font-semibold text-gray-950">{item.title}</p><p className="mt-1 truncate text-xs text-gray-500">/collections/{item.slug}</p></div>
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{item.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{item.published ? "Published" : "Draft"}</span>
            <span className="text-sm text-gray-600">{item.content?.recipeSlugs.length || 0} recipes · {item.content?.productIds.length || 0} picks</span>
            <div className="flex justify-end gap-1"><button onClick={() => { setEditingId(item.id); setDraft(toDraft(item)); setOpen(true); }} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button><button onClick={() => void remove(item)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
          </div>
        )) : <div className="px-6 py-16 text-center text-sm text-gray-500">No collections yet.</div>}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm md:p-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-xl md:px-8"><div><h2 className="text-xl font-bold">{editingId ? "Edit collection" : "New collection"}</h2><p className="mt-1 text-xs text-gray-500">Story + recipes + live products</p></div><button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button></div>
            <div className="space-y-9 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">Title</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Slug</span><input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Generated if empty" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Eyebrow</span><input value={draft.eyebrow} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">Summary</span><textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="min-h-24 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">Story</span><textarea value={draft.story} onChange={(e) => setDraft({ ...draft, story: e.target.value })} className="min-h-36 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Occasion</span><input value={draft.occasion} onChange={(e) => setDraft({ ...draft, occasion: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Sunday brunch" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Theme tags</span><input value={draft.themeTags} onChange={(e) => setDraft({ ...draft, themeTags: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="weekend, seasonal" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Hero image URL</span><input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Image alt</span><input value={draft.imageAlt} onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
                <label><span className="mb-2 block text-sm font-semibold">Tags</span><input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              </div>

              <section><h3 className="font-bold text-gray-950">Recipes in this edit</h3><p className="mt-1 text-xs text-gray-500">Order follows selection order.</p><div className="mt-4 grid max-h-64 gap-2 overflow-y-auto rounded-2xl border border-gray-200 p-3 md:grid-cols-2">{recipes.map((recipe) => <label key={recipe.id} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm ${draft.recipeSlugs.includes(recipe.slug) ? "bg-emerald-50 text-emerald-900" : "hover:bg-gray-50"}`}><input type="checkbox" checked={draft.recipeSlugs.includes(recipe.slug)} onChange={() => toggleRecipe(recipe.slug)} /><span className="min-w-0 truncate">{recipe.title}</span>{!recipe.published && <span className="ml-auto text-[10px] text-amber-600">draft</span>}</label>)}</div></section>

              <section><h3 className="font-bold text-gray-950">Products in this edit</h3><p className="mt-1 text-xs text-gray-500">Use for seasonal picks, maker drops or complementary shelf items.</p><div className="mt-4 grid max-h-72 gap-2 overflow-y-auto rounded-2xl border border-gray-200 p-3 md:grid-cols-2">{products.map((product) => { const id = product.id || product._id || ""; return <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm ${draft.productIds.includes(id) ? "bg-emerald-50 text-emerald-900" : "hover:bg-gray-50"}`}><input type="checkbox" checked={draft.productIds.includes(id)} onChange={() => toggleProduct(id)} /><span className="min-w-0 flex-1 truncate">{product.name}</span><span className="text-[10px] text-gray-400">stock {product.stockQty}</span></label>; })}</div></section>

              <div className="grid gap-5 md:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold">SEO title</span><input value={draft.metaTitle} onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label><label><span className="mb-2 block text-sm font-semibold">SEO description</span><input value={draft.metaDescription} onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></label></div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6"><label className="inline-flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Publish immediately</label><div className="flex gap-3"><button onClick={() => setOpen(false)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold">Cancel</button><button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save collection"}</button></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
