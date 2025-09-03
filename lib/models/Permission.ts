import mongoose, { Document, Schema } from "mongoose";

export interface IPermission extends Document {
  resource: string;
  operation: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const permissionSchema = new Schema<IPermission>({
  resource: {
    type: String,
    required: [true, "Resource name is required"],
    lowercase: true,
    unique: true,
  },
  operation: {
    type: String,
    required: [true, "Operation is required"],
    lowercase: true,
    enum: ["create", "read", "update", "delete"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
}, { timestamps: true });

permissionSchema.index({ resource: 1, operation: 1 });

const Permission = mongoose.models.Permission || mongoose.model<IPermission>("Permission", permissionSchema);
export default Permission;
