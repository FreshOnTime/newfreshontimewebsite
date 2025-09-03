import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType: 'user' | 'customer' | 'supplier' | 'category' | 'product' | 'order' | 'auth';
  resourceId?: mongoose.Types.ObjectId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['user', 'customer', 'supplier', 'category', 'product', 'order', 'auth'],
  },
  resourceId: {
    type: Schema.Types.ObjectId,
  },
  before: {
    type: Schema.Types.Mixed,
  },
  after: {
    type: Schema.Types.Mixed,
  },
  ip: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false, // We use our own timestamp field
});

// Indexes
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
