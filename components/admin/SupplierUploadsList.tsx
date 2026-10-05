"use client";

import { useState } from 'react';
import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, FileSpreadsheet, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json());

interface UploadData {
  _id: string;
  supplierId: string;
  supplierName?: string;
  supplierCompany?: string;
  supplierEmail?: string;
  supplierStatus?: string;
  originalName: string;
  filename: string;
  createdAt: string;
  path?: string;
  preview?: Record<string, unknown>[];
  mimeType?: string;
}

export default function SupplierUploadsList() {
  const { data, error, mutate } = useSWR('/api/admin/supplier-uploads', fetcher);
  const [selectedUpload, setSelectedUpload] = useState<UploadData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-100 flex items-center gap-2"><AlertCircle size={20} /> Failed to load uploads</div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading uploads...</div>;

  const uploads = data.data as UploadData[];

  const doImport = async (id: string) => {
    if (!confirm('Import this upload into products?')) return;
    try {
      const res = await fetch('/api/admin/supplier-uploads/import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: id })
      });
      const j = await res.json();
      if (j.success) {
        alert(`Created ${j.results.created.length}, updated ${j.results.updated?.length || 0}, ${j.results.errors.length} errors`);
        mutate();
      } else {
        alert('Import failed: ' + (j.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Import failed: Network error');
    }
  };

  const doResolve = async (id: string | undefined) => {
    if (!id) return;
    try {
      const res = await fetch('/api/admin/supplier-uploads/resolve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: id })
      });
      const j = await res.json();
      if (j.success) {
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
      const res = await fetch('/api/admin/supplier-uploads/delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: id })
      });
      const j = await res.json();
      if (j.success) {
        mutate();
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Delete failed');
    }
  };

  const handlePreview = (upload: UploadData) => {
    setSelectedUpload(upload);
    setIsPreviewOpen(true);
  };

  const getBadges = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <Badge className="bg-secondary text-brand-green hover:bg-secondary">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default: return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <>
      <div className="bg-background rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-brand-green" />
            Uploaded Files
          </h3>
          <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-full">{uploads.length} files</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-[250px]">Supplier Details</TableHead>
                <TableHead>File Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No uploads found
                  </TableCell>
                </TableRow>
              ) : uploads.map((u) => (
                <TableRow key={u._id} className="group hover:bg-secondary transition-colors">
                  <TableCell className="align-top py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{u.supplierName || u.supplierCompany || 'Unknown Supplier'}</div>
                      <div className="text-sm text-muted-foreground">{u.supplierEmail}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">{u.supplierId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {u.originalName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-4">
                    {getBadges(u.supplierStatus || '')}
                  </TableCell>
                  <TableCell className="align-top py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-muted-foreground border-border hover:bg-secondary hover:text-brand-green hover:border-border"
                        onClick={() => handlePreview(u)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>

                      <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-muted-foreground border-border">
                        <a href={`/api/admin/supplier-uploads/${u._id}/download`}>
                          <Download className="h-3.5 w-3.5" />
                          Download original
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-brand-green border-border bg-secondary hover:bg-secondary hover:border-border"
                        onClick={() => doImport(u._id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Import
                      </Button>

                      {!u.supplierName && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => doResolve(u._id)}
                        >
                          Resolve
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        onClick={() => doDelete(u._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>File Preview: {selectedUpload?.originalName}</DialogTitle>
            <DialogDescription>
              Displaying the first 20 rows of the uploaded file.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-md mt-4">
            {selectedUpload?.preview && selectedUpload.preview.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary sticky top-0">
                    {Object.keys(selectedUpload.preview[0]).map((header) => (
                      <TableHead key={header} className="whitespace-nowrap font-bold text-foreground">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedUpload.preview.map((row, i) => (
                    <TableRow key={i} className="hover:bg-secondary">
                      {Object.values(row).map((val, j) => (
                        <TableCell key={j} className="whitespace-nowrap max-w-[200px] truncate" title={String(val)}>
                          {String(val ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No preview data available for this file.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
