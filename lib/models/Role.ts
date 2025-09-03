import mongoose, { Document, Schema } from "mongoose";
import { IPermission } from "./Permission";

export interface IRole extends Document {
  name: string;
  permissions: mongoose.Types.ObjectId[] | IPermission[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  description: { type: String },
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
export default Role;
