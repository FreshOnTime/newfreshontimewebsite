import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  recipientName: string;
  streetAddress: string;
  streetAddress2?: string;
  town: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  coordinates?: [number, number]; // [longitude, latitude]
  type: "Home" | "Business" | "School" | "Other";
}

const addressSchema: Schema = new Schema<IAddress>(
  {
    recipientName: {
      type: String,
      required: [true, "Address: Recipient name is required"],
      maxlength: [80, "Address: Recipient name cannot exceed 80 characters"],
    },
    streetAddress: {
      type: String,
      required: [true, "Address: Street address is required"],
      maxlength: [100, "Address: Street address cannot exceed 100 characters"],
    },
    streetAddress2: {
      type: String,
      required: false,
      maxlength: [
        100,
        "Address: Street address 2 cannot exceed 100 characters",
      ],
    },
    town: {
      type: String,
      required: [true, "Address: Town is required"],
      maxlength: [100, "Address: Town cannot exceed 100 characters"],
    },
    city: {
      type: String,
      required: [true, "Address: City is required"],
      maxlength: [100, "Address: City cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "Address: State is required"],
      maxlength: [100, "Address: State cannot exceed 100 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Address: Postal code is required"],
      maxlength: [100, "Address: Postal code cannot exceed 100 characters"],
    },
    countryCode: {
      type: String,
      default: "LK",
      maxlength: [2, "Address: Country code must be 2 characters"],
      minlength: [2, "Address: Country code must be 2 characters"],
      uppercase: true,
      match: [/^[A-Z]{2}$/, "Address: Invalid country code format"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Address: Phone number is required"],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
    type: {
      type: String,
      enum: ["Home", "Business", "School", "Other"],
      required: [true, "Address: Type is required"],
      default: "Home",
    },
  },
  { timestamps: true }
);

const Address = mongoose.models.Address || mongoose.model<IAddress>("Address", addressSchema);
export { addressSchema, Address };

