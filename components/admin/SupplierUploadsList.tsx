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
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left sticky top-0 bg-white/95 backdrop-blur z-10">Supplier</th>
              <th className="text-left sticky top-0 bg-white/95 backdrop-blur z-10">Company</th>
              <th className="text-left sticky top-0 bg-white/95 backdrop-blur z-10">Email</th>
              <th className="text-left sticky top-0 bg-white/95 backdrop-blur z-10">Phone</th>
              <th className="text-left sticky top-0 bg-white/95 backdrop-blur z-10">Status</th>
              <th className="text-left sticky top-0 bg-white/95 backdrop-blur z-10">File / Uploaded</th>
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
                <tr key={id} className="border-t align-top">
                  <td className="py-2">
                    <div className="text-sm font-medium truncate max-w-full">{supplierName || supplierId}</div>
                    {supplierName ? <div className="text-xs text-gray-500 truncate max-w-full">{supplierId}</div> : null}
                  </td>
                  <td className="py-2 text-sm text-gray-600 truncate max-w-full">{supplierCompany || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2 text-sm text-gray-600 truncate max-w-full">{(u['supplierEmail'] as string) || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2 text-sm text-gray-600 truncate max-w-full">{(u['supplierPhone'] as string) || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2 text-sm text-gray-600 truncate max-w-full">{(u['supplierStatus'] as string) || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2">
                    <div className="truncate max-w-full">{originalName || filename}</div>
                    <div className="text-xs text-gray-500">{createdAt ? new Date(createdAt as string).toLocaleString() : ''}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a className="text-blue-600 truncate" href={path} download>Download</a>
                      <button onClick={() => doImport(id!)} className="text-green-600 truncate">Import</button>
                      {!supplierName && <button onClick={() => doResolve(id)} className="text-amber-600 truncate">Resolve</button>}
                      <button onClick={() => doDelete(id)} className="text-red-600 truncate">Delete</button>
                    </div>
                  </td>
                </tr>
              );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
