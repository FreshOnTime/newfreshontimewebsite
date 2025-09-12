import mongoose, { Document, Schema } from "mongoose";
import { IAddress, addressSchema } from "./Address";

export interface IRefreshToken {
  hashedToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IUser extends Document {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  passwordHash?: string; // For email/password authentication
  addresses: IAddress[];
  registrationAddress: IAddress;
  supplierId?: mongoose.Types.ObjectId;
  role:
    | "customer"
    | "supplier"
    | "admin"
    | "manager"
    | "delivery_staff"
    | "customer_support"
    | "marketing_specialist"
    | "order_processor"
    | "inventory_manager";
  secondaryRoles?:
    | "customer"
  | "supplier"
    | "delivery_staff"
    | "customer_support"
    | "order_processor"
    | "inventory_manager"
    | "marketing_specialist"[];
  isBanned?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  giftCardBalance?: number;
  refreshTokens?: IRefreshToken[]; // For JWT refresh token management
  createdAt?: Date;
  updatedAt?: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  hashedToken: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema: Schema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: [true, "User: User ID is required"],
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "User: First name is required"],
      maxlength: [30, "User: First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      maxlength: [30, "User: Last name cannot exceed 30 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "User: Phone number is required"],
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    passwordHash: {
      type: String,
      // Required if email is provided (for email/password auth)
    },
    addresses: {
      type: [addressSchema],
    },
    registrationAddress: {
      type: addressSchema,
      required: [true, "Registration address is required"],
    },
    role: {
      type: String,
      enum: {
        values: [
          "customer",
          "supplier",
          "admin",
          "manager",
          "delivery_staff",
          "customer_support",
          "marketing_specialist",
          "order_processor",
          "inventory_manager",
        ],
        message: "User: {VALUE} is not a valid role",
      },
      default: "customer",
    },
    secondaryRoles: {
      type: [String],
      enum: {
        values: [
          "customer",
          "delivery_staff",
          "customer_support",
          "order_processor",
          "inventory_manager",
          "marketing_specialist",
        ],
        message: "User: {VALUE} is not a valid secondary role",
      },
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    giftCardBalance: {
      type: Number,
      default: 0,
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
export { userSchema };
