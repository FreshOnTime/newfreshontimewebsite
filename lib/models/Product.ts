import mongoose, { Document, Schema } from "mongoose";
import imageSchema, { IImage } from "./Image";

export interface IProduct extends Document {
  name: string;
  image: IImage;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  description: string;
  ingredients?: string;
  nutritionFacts?: string;
  searchContent: string;
  isDisabled: boolean;
  isDeleted: boolean;
  baseMeasurementQuantity: number;
  pricePerBaseQuantity: number;
  measurementType: "g" | "kg" | "ml" | "l" | "unit" | "lb";
  isSoldAsUnit: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  stepQuantity: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
  totalSales: number;
  isFeatured?: boolean;
  discountPercentage?: number;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

const productSchema: Schema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product: Name is required"],
      minlength: [3, "Product: Name must be at least 3 characters long"],
      maxlength: [100, "Product: Name must be at most 100 characters long"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Product: Brand is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: [true, "Product: Category is required"],
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    searchContent: {
      type: String,
      required: [true, "Product: Search content is required"],
      minlength: [3, "Product: Search content must be at least 3 characters long"],
      maxlength: [500, "Product: Search content must be at most 500 characters long"],
    },
    image: {
      type: imageSchema,
      required: [true, "Product: Images are required"],
    },
    description: {
      type: String,
      required: [true, "Product: Description is required"],
      minlength: [5, "Product: Description must be at least 5 characters long"],
      maxlength: [500, "Product: Description must be at most 500 characters long"],
    },
    ingredients: {
      type: String,
      maxlength: [500, "Product: Ingredients must be at most 500 characters long"],
    },
    nutritionFacts: {
      type: String,
      maxlength: [300, "Product: Nutrition facts must be at most 300 characters long"],
    },
    baseMeasurementQuantity: {
      type: Number,
      required: [true, "Product: Base measurement quantity is required"],
      min: [0, "Product: Base measurement quantity must be a non-negative number"],
    },
    pricePerBaseQuantity: {
      type: Number,
      required: [true, "Product: Price per base quantity is required"],
      min: [0, "Product: Price per base quantity must be a non-negative number"],
    },
    measurementType: {
      type: String,
      enum: ["g", "kg", "ml", "l", "unit", "lb"],
      required: [true, "Product: Measurement type is required"],
    },
    isSoldAsUnit: {
      type: Boolean,
      required: [true, "Product: Is sold as unit is required"],
    },
    minOrderQuantity: {
      type: Number,
      required: [true, "Product: Minimum order quantity is required"],
      min: [0, "Product: Minimum order quantity must be a non-negative number"],
    },
    maxOrderQuantity: {
      type: Number,
      required: [true, "Product: Maximum order quantity is required"],
      min: [0, "Product: Maximum order quantity must be a non-negative number"],
    },
    stepQuantity: {
      type: Number,
      required: [true, "Product: Step quantity is required"],
      min: [0, "Product: Step quantity must be a non-negative number"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Product: Stock quantity is required"],
      min: [0, "Product: Stock quantity must be a non-negative number"],
    },
    lowStockThreshold: {
      type: Number,
      required: [true, "Product: Low stock threshold is required"],
      min: [0, "Product: Low stock threshold must be a non-negative number"],
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: Number,
      min: [0, "Product: Discount percentage must be a non-negative number"],
      max: [100, "Product: Discount percentage cannot exceed 100"],
    },
    createdBy: {
      type: String,
      required: [true, "Product: Created By is required"],
    },
    updatedBy: {
      type: String,
      required: [true, "Product: Updated By is required"],
    },
  },
  { timestamps: true }
);

// Update the text index to include name, description, and searchContent
productSchema.index({
  name: "text",
  description: "text",
  searchContent: "text",
});

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
export default Product;
