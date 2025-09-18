import mongoose, { Document, Schema } from "mongoose";

export type TokenType = "verify" | "reset";

export interface IEmailToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
}

const emailTokenSchema: Schema = new Schema<IEmailToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    type: { type: String, enum: ["verify", "reset"], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const EmailToken = mongoose.models.EmailToken || mongoose.model<IEmailToken>("EmailToken", emailTokenSchema);

export default EmailToken;
