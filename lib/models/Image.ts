import { Schema, Document } from "mongoose";

export interface IImage extends Document {
  url: string;
  filename: string;
  contentType: string;
  path: string;
  alt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const imageSchema: Schema = new Schema<IImage>(
  {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default imageSchema;
