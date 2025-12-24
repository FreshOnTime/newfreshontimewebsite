"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";

interface NotificationForm {
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error" | "promo";
    targetUserId: string;
    link?: string;
}

export default function NotificationsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<NotificationForm>({
        defaultValues: {
            type: "info",
            targetUserId: "all",
        }
    });

    const type = watch("type");

    const onSubmit = async (data: NotificationForm) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Notification sent successfully");
                reset();
            } else {
                toast.error(result.message || "Failed to send notification");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 p-8 max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="bg-blue-50 p-3 rounded-2xl">
                    <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notification Center</h1>
                    <p className="text-gray-500 mt-1">Send update, alerts, and promotions to your users.</p>
                </div>
            </div>

            <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-xl ring-1 ring-black/5">
                <CardHeader>
                    <CardTitle>Send Web Notification</CardTitle>
                    <CardDescription>Create a new notification to broadcast.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Notification Title</label>
                                <Input
                                    {...register("title", { required: "Title is required" })}
                                    placeholder="e.g., Flash Sale Alert!"
                                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Notification Type</label>
                                <Select onValueChange={(val) => setValue("type", val as any)} defaultValue="info">
                                    <SelectTrigger className="bg-white/50 border-gray-200">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">Information</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                        <SelectItem value="promo">Promotion</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Message Content</label>
                            <Textarea
                                {...register("message", { required: "Message is required" })}
                                placeholder="Write your message here..."
                                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                            />
                            {errors.message && <span className="text-xs text-red-500">{errors.message.message}</span>}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Target User</label>
                                <Select onValueChange={(val) => setValue("targetUserId", val)} defaultValue="all">
                                    <SelectTrigger className="bg-white/50 border-gray-200">
                                        <SelectValue placeholder="Select target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users (Broadcast)</SelectItem>
                                        {/* In a real app, you'd fetch users here or have a user picker */}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">Currently only 'All Users' broadcast is supported nicely in this UI.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Action Link (Optional)</label>
                                <Input
                                    {...register("link")}
                                    placeholder="e.g., /deals"
                                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8"
                            >
                                {isSubmitting ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Notification
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Could list past notifications here */}
        </div>
    );
}
