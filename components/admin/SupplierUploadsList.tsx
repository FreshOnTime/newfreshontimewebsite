"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json());

export default function SupplierUploadsList() {
  const { data, error, mutate } = useSWR('/api/admin/supplier-uploads', fetcher);

  if (error) return <div className="text-red-600">Failed to load uploads</div>;
  if (!data) return <div>Loading...</div>;

  const doImport = async (id: string) => {
    if (!confirm('Import this upload into products?')) return;
    const res = await fetch('/api/admin/supplier-uploads/import', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadId: id }) });
    const j = await res.json();
    if (j.success) alert(`Created ${j.results.created.length} products, ${j.results.errors.length} errors`);
    else alert('Import failed');
  };

  const doResolve = async (id: string | undefined) => {
    if (!id) return;
    try {
      const res = await fetch('/api/admin/supplier-uploads/resolve', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadId: id }) });
      const j = await res.json();
      if (j.success) {
        // revalidate list
        mutate();
        alert('Resolved supplier info for upload');
      } else {
        alert('Resolve failed');
      }
    } catch {
      alert('Resolve failed');
    }
  };

  const doDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Permanently delete this upload? This will remove the file and its record.')) return;
    try {
      const res = await fetch('/api/admin/supplier-uploads/delete', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadId: id }) });
      const j = await res.json();
      if (j.success) {
        mutate();
        alert('Upload deleted');
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">Supplier Uploads</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Supplier</th>
            <th className="text-left">Company</th>
           
            <th className="text-left">File</th>
            <th className="text-left">Uploaded</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(data.data as unknown[]).map((uRaw) => {
            const u = uRaw as Record<string, unknown>;
            const supplierName = u['supplierName'] as string | undefined;
            const rawSupplierId = u['supplierId'] as unknown;
            let supplierId: string | undefined;
            if (rawSupplierId != null) {
              if (typeof rawSupplierId === 'string') supplierId = rawSupplierId;
              else if (typeof (rawSupplierId as { toString?: () => string }).toString === 'function') {
                supplierId = (rawSupplierId as { toString: () => string }).toString();
              }
            }
            const supplierCompany = u['supplierCompany'] as string | undefined;
            const originalName = u['originalName'] as string | undefined;
            const filename = u['filename'] as string | undefined;
            const createdAt = u['createdAt'] as string | number | Date | undefined;
            const path = u['path'] as string | undefined;
            const id = u['_id'] as string | undefined;
            return (
              <tr key={id} className="border-t">
                <td className="py-2">
                  <div className="text-sm font-medium">{supplierName || supplierId}</div>
                  {supplierName ? <div className="text-xs text-gray-500">{supplierId}</div> : null}
                </td>
                <td className="py-2 text-sm text-gray-600">{supplierCompany || <span className="text-gray-400">—</span>}</td>
                <td className="py-2 text-sm text-gray-600">{(u['supplierEmail'] as string) || <span className="text-gray-400">—</span>}</td>
                <td className="py-2 text-sm text-gray-600">{(u['supplierPhone'] as string) || <span className="text-gray-400">—</span>}</td>
                <td className="py-2 text-sm text-gray-600">{(u['supplierStatus'] as string) || <span className="text-gray-400">—</span>}</td>
                <td className="py-2">{originalName || filename}</td>
                <td className="py-2">{createdAt ? new Date(createdAt as string).toLocaleString() : ''}</td>
                <td className="flex gap-2">
                  <a className="text-blue-600" href={path} download>Download</a>
                  <button onClick={() => doImport(id!)} className="text-green-600">Import</button>
                  {!supplierName && <button onClick={() => doResolve(id)} className="text-amber-600">Resolve</button>}
                  <button onClick={() => doDelete(id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
