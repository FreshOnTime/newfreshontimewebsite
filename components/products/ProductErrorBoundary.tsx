"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ProductErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Product Error Boundary caught an error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl text-center">
                    <div className="bg-amber-100 rounded-full p-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4 max-w-sm">
                        We couldn&apos;t load this section. Please try again.
                    </p>
                    <Button
                        onClick={this.handleRetry}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
