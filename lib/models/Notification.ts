import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'promo';
    targetUser?: mongoose.Types.ObjectId; // If null, it's a broadcast to all
    isRead: boolean;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error', 'promo'],
            default: 'info',
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Broadcast if null
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
notificationSchema.index({ targetUser: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
