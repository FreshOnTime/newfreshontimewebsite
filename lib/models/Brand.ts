import mongoose, { Document, Schema } from "mongoose";

export interface IBrand extends Document {
  code: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const brandSchema: Schema = new Schema<IBrand>(
  {
    code: {
      type: String,
      required: [true, "Brand code is required"],
      unique: true,
      minlength: [3, "Brand code must be at least 3 characters long"],
      maxlength: [3, "Brand code cannot exceed 3 characters"],
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Brand name is required"],
      minlength: [3, "Brand name must be at least 3 characters long"],
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.models.Brand || mongoose.model<IBrand>("Brand", brandSchema);
export default Brand;
