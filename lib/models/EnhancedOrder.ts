import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  bagId?: mongoose.Types.ObjectId;
  bagName?: string;
  customerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  // Recurring scheduling
  isRecurring?: boolean;
  recurrence?: {
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6 (Sun-Sat)
    includeDates?: Date[];
    excludeDates?: Date[];
    selectedDates?: Date[]; // concrete delivery dates generated/selected
    notes?: string;
  };
  nextDeliveryAt?: Date;
  scheduleStatus?: 'active' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
  ref: 'EnhancedProduct',
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const addressSchema = new Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
});

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  bagId: {
    type: Schema.Types.ObjectId,
    ref: 'Bag',
    required: false,
  },
  bagName: {
    type: String,
    required: false,
    trim: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  discount: {
    type: Number,
    min: 0,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'bank_transfer', 'digital_wallet'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  notes: {
    type: String,
    maxlength: 1000,
  },
  // Recurring fields
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    startDate: Date,
    endDate: Date,
    daysOfWeek: { type: [Number], default: undefined },
    includeDates: { type: [Date], default: undefined },
    excludeDates: { type: [Date], default: undefined },
    selectedDates: { type: [Date], default: undefined },
    notes: { type: String, maxlength: 1000 },
  },
  nextDeliveryAt: Date,
  scheduleStatus: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: undefined,
  },
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ bagId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });
orderSchema.index({ isRecurring: 1 });
orderSchema.index({ nextDeliveryAt: 1 });

// In dev, Next may have registered a different 'Order' schema earlier. Ensure we use the enhanced schema.
let EnhancedOrderModel: mongoose.Model<IOrder>;
if (!mongoose.models.Order) {
  EnhancedOrderModel = mongoose.model<IOrder>('Order', orderSchema);
} else {
  const existing = mongoose.models.Order as mongoose.Model<IOrder> & { schema: mongoose.Schema };
  // If recurring fields are missing, re-register with the enhanced schema
  const hasRecurring = Boolean(existing.schema.path('isRecurring') && existing.schema.path('recurrence') && existing.schema.path('nextDeliveryAt'));
  if (!hasRecurring) {
    delete mongoose.models.Order;
    EnhancedOrderModel = mongoose.model<IOrder>('Order', orderSchema);
  } else {
    EnhancedOrderModel = existing as mongoose.Model<IOrder>;
  }
}

export default EnhancedOrderModel;
