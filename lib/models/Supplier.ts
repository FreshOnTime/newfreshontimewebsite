import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentTerms: string;
  notes?: string;
  status: 'active' | 'inactive';
  totalProducts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentTerms: {
    type: String,
    required: true,
    enum: ['net-15', 'net-30', 'net-60', 'net-90', 'cod', 'prepaid'],
    default: 'net-30',
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  totalProducts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

supplierSchema.index({ name: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ createdAt: -1 });

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', supplierSchema);
