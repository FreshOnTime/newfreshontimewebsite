"use client";

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCcw } from 'lucide-react';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

interface SupplierProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  stockQty: number;
  minStockLevel: number;
  archived: boolean;
  category?: { name: string; slug: string } | null;
}

export default function UploadProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await authenticatedApiFetch('/api/suppliers/products?limit=100', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to load your products');
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (failure) {
      setProductsError(failure instanceof Error ? failure.message : 'Unable to load your products');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void fetch('/api/categories')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('categories unavailable')))
      .then(data => {
        const rows = Array.isArray(data?.data) ? data.data : [];
        setCategorySlugs(rows.map((category: { slug?: unknown }) => typeof category.slug === 'string' ? category.slug : '').filter(Boolean));
      })
      .catch(() => setCategorySlugs([]));
  }, [loadProducts]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    setMessage(null);
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    const lowerName = next.name.toLowerCase();
    if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      setFile(null);
      setError('Choose a CSV or Excel catalogue (.csv, .xlsx or .xls).');
      e.currentTarget.value = '';
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      setFile(null);
      setError('Catalogue files must be 5 MB or smaller.');
      e.currentTarget.value = '';
      return;
    }
    setFile(next);
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file to upload');
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await authenticatedApiFetch('/api/suppliers/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileData: dataUrl,
          mimeType: file.type || undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Upload failed');
      setMessage('File uploaded — admin will review and import it shortly.');
      setFile(null);
    } catch (failure) {
      console.error('UploadProducts upload error:', failure);
      setError(failure instanceof Error ? failure.message : 'Upload error');
    } finally {
      setLoading(false);
    }
  };

  const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-background p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-semibold">Upload Product List</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload an Excel (.xlsx) or CSV (.csv) catalogue. Use the FreshPick template so the admin import maps every field correctly.
            </p>
          </div>
          <a href="/templates/product-upload-template.csv" download className="text-sm font-medium text-brand-green hover:underline">
            Download Template
          </a>
        </div>

        <div className="mt-5 grid grid-cols-1 items-center gap-4 md:grid-cols-3">
          <label className="col-span-2 flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-3 hover:bg-secondary/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-brand-green" aria-hidden="true">
              <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="text-sm font-medium">Choose file</div>
              <div className="text-xs text-muted-foreground">.xlsx or .csv — up to 5 MB</div>
            </div>
            <input className="sr-only" type="file" accept=".csv,.xlsx,.xls" onChange={onChange} />
          </label>

          <div className="rounded-md border bg-background p-3">
            <div className="text-xs text-muted-foreground">Selected file</div>
            <div className="mt-1 break-all text-sm font-medium">{file ? file.name : <span className="text-muted-foreground">No file chosen</span>}</div>
            {file && <div className="mt-1 text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>}
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-leaf px-3 py-2 text-brand-ink disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{loading ? 'Uploading…' : 'Send to Admin'}</span>
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Template fields: SKU, name, description, selling price, cost price, stock, minimum stock, category slug, tags, unit, unit quantity, supplier SKU and optional image URL.
        </p>
        {categorySlugs.length > 0 && (
          <details className="mt-3 rounded-md border border-border bg-secondary/30 p-3 text-xs">
            <summary className="cursor-pointer font-medium text-brand-green">Valid category slugs</summary>
            <p className="mt-2 leading-6 text-muted-foreground">
              Use one of these values in <code>categorySlug</code>, or leave the cell blank for admin categorisation:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categorySlugs.map(slug => <code key={slug} className="rounded bg-background px-2 py-1 text-foreground">{slug}</code>)}
            </div>
          </details>
        )}
        {message && <div className="mt-4 rounded bg-secondary p-3 text-sm text-brand-green">{message}</div>}
        {error && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </section>

      <section className="rounded-lg border border-border bg-background">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Your FreshPick products</h3>
            <p className="mt-1 text-xs text-muted-foreground">Products appear here as soon as an admin imports them from your uploaded catalogue.</p>
          </div>
          <button
            onClick={() => void loadProducts()}
            disabled={productsLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm text-brand-green disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${productsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {productsLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading products…</div>
        ) : productsError ? (
          <div className="p-6 text-sm text-amber-700">{productsError}</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No imported products yet. Upload your catalogue and wait for admin review/import.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-5 py-4 font-medium">{product.name}</td>
                    <td className="px-5 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-5 py-4">{product.category?.name || 'Uncategorised'}</td>
                    <td className="px-5 py-4 tabular-nums">{money(product.price)}</td>
                    <td className="px-5 py-4 tabular-nums">{product.stockQty}</td>
                    <td className="px-5 py-4">{product.archived ? 'Archived' : 'Active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
