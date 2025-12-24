import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  slug: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  stockQty: number;
  minStockLevel?: number;
  // Optional single image convenience alongside array
  image?: string;
  images?: string[];
  tags: string[];
  attributes: Record<string, unknown>;
  archived: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isBundle?: boolean;
  bundleItems?: { product: mongoose.Types.ObjectId; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false,
  },
  stockQty: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minStockLevel: {
    type: Number,
    min: 0,
    default: 5,
  },
  image: {
    type: String,
  },
  images: [{
    type: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  attributes: {
    type: Schema.Types.Mixed,
    default: {},
  },
  archived: {
    type: Boolean,
    default: false,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  isBundle: {
    type: Boolean,
    default: false,
  },
  bundleItems: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'EnhancedProduct',
    },
    quantity: {
      type: Number,
      default: 1,
    },
  }],
}, {
  timestamps: true,
});

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ archived: 1 });
productSchema.index({ stockQty: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function () {
  return this.price - this.costPrice;
});

// Virtual for profit percentage
productSchema.virtual('profitPercentage').get(function () {
  return this.costPrice > 0 ? ((this.price - this.costPrice) / this.costPrice * 100) : 0;
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function () {
  return this.stockQty <= (this.minStockLevel || 5);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

export default mongoose.models.EnhancedProduct || mongoose.model<IProduct>('EnhancedProduct', productSchema);
