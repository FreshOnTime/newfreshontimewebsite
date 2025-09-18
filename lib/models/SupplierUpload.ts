import mongoose from 'mongoose';

const SupplierUploadSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String },
  supplierCompany: { type: String },
  supplierEmail: { type: String },
  supplierPhone: { type: String },
  supplierContactName: { type: String },
  supplierStatus: { type: String },
  filename: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  path: { type: String },
  preview: { type: Array, default: [] },
  createdAt: { type: Date, default: () => new Date() }
});

export default mongoose.models.SupplierUpload || mongoose.model('SupplierUpload', SupplierUploadSchema);
