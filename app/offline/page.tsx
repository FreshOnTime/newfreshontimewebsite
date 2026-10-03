"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="bg-background rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <WifiOff className="w-12 h-12 text-muted-foreground" />
                </div>

                <h1 className="text-2xl font-normal text-foreground mb-3">
                    You&apos;re Offline
                </h1>

                <p className="text-muted-foreground mb-8">
                    It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-brand-leaf hover:bg-brand-leaf gap-2"
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

                <p className="text-sm text-muted-foreground mt-8">
                    Don&apos;t worry, your cart items are saved and will be here when you&apos;re back online.
                </p>
            </div>
        </div>
    );
}
