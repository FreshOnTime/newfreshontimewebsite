"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="bg-zinc-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <WifiOff className="w-12 h-12 text-zinc-400" />
                </div>

                <h1 className="text-2xl font-bold text-zinc-900 mb-3">
                    You&apos;re Offline
                </h1>

                <p className="text-zinc-600 mb-8">
                    It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>

                    <Button asChild variant="outline">
                        <Link href="/" className="gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Link>
                    </Button>
                </div>

                <p className="text-sm text-zinc-500 mt-8">
                    Don&apos;t worry, your cart items are saved and will be here when you&apos;re back online.
                </p>
            </div>
        </div>
    );
}
