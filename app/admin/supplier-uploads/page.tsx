"use client";

import SupplierUploadsList from '@/components/admin/SupplierUploadsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupplierUploadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supplier Product Uploads</h1>
        <p className="text-gray-600">View and manage supplier file uploads awaiting review or import.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplierUploadsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
