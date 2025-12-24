"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error" | "promo";
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/admin/notifications");
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        // In a real app we'd call an API to mark as read
        // For now purely UI state locally for demo
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50 hover:text-primary transition-colors rounded-xl">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 h-4 min-w-[16px] flex items-center justify-center border-0 shadow-sm animate-pulse">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-premium border-gray-100 max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel className="p-4 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white z-10">
                    <span className="font-bold text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}>Mark all read</span>
                    )}
                </DropdownMenuLabel>

                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                onClick={() => markAsRead(notification._id)}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notification.type === 'promo' ? 'bg-purple-500' :
                                            notification.type === 'warning' ? 'bg-yellow-500' :
                                                notification.type === 'error' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                        }`} />
                                    <div className="space-y-1">
                                        <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <span className="text-[10px] text-gray-400 block pt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                                {notification.link && (
                                    <Link
                                        href={notification.link}
                                        className="absolute inset-0 z-10"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
