import mongoose, { Document, Schema } from "mongoose";

export interface IProductCategory extends Document {
  code: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const productCategorySchema: Schema = new Schema<IProductCategory>(
  {
    code: {
      type: String,
      required: [true, "Category code is required"],
      unique: true,
      minlength: [3, "Category code must be at least 3 characters long"],
      maxlength: [3, "Category code must be at most 3 characters long"],
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      minlength: [3, "Category description must be at least 3 characters long"],
      maxlength: [
        30,
        "Category description must be at most 30 characters long",
      ],
    },
  },
  { timestamps: true }
);

const ProductCategory = mongoose.models.ProductCategory || mongoose.model<IProductCategory>(
  "ProductCategory",
  productCategorySchema
);
export default ProductCategory;
