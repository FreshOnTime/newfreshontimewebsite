import mongoose, { Document, Schema } from "mongoose";

// Define a simpler image interface for blogs
export interface IBlogImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: IBlogImage;
  author: mongoose.Types.ObjectId;
  authorName?: string;
  category?: string;
  tags: string[];
  published: boolean;
  publishedAt?: Date;
  views: number;
  likes: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Define a simpler image schema that doesn't require filename/path/contentType
const blogImageSchema = new Schema({
  url: {
    type: String,
    required: [true, "Blog image URL is required"],
  },
  alt: {
    type: String,
    trim: true,
  },
  width: Number,
  height: Number,
}, { _id: false });

const blogSchema: Schema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Blog: Title is required"],
      minlength: [5, "Blog: Title must be at least 5 characters long"],
      maxlength: [200, "Blog: Title must be at most 200 characters long"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Blog: Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [250, "Blog: Slug must be at most 250 characters long"],
    },
    excerpt: {
      type: String,
      required: [true, "Blog: Excerpt is required"],
      minlength: [10, "Blog: Excerpt must be at least 10 characters long"],
      maxlength: [500, "Blog: Excerpt must be at most 500 characters long"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Blog: Content is required"],
      minlength: [50, "Blog: Content must be at least 50 characters long"],
    },
    featuredImage: {
      type: blogImageSchema,
      required: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blog: Author is required"],
    },
    authorName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, "Blog: Category must be at most 100 characters long"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 20;
        },
        message: "Blog: Cannot have more than 20 tags"
      }
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Blog: Views cannot be negative"],
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "Blog: Likes cannot be negative"],
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Blog: Meta title must be at most 100 characters long"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Blog: Meta description must be at most 300 characters long"],
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Text index for search functionality
blogSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  tags: "text",
});

// Index for better query performance
blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ isDeleted: 1 });

const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;

