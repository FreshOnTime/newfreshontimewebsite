"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api/client";
import { SUPPORT_EMAIL } from "@/lib/config/site";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiFetch("/api/newsletter", {
                method: "POST",
                body: JSON.stringify({ email, source: "homepage" }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Welcome to Fresh Pick! Check your email for updates.");
                setEmail("");
            } else {
                toast.error(data.error || "Something went wrong. Please try again.");
            }
        } catch {
            toast.error("Failed to subscribe. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 py-16 text-white md:py-24">
            <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-teal-500/20 blur-3xl" />

            <div className="container relative mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <span className="mb-4 block text-sm font-semibold uppercase tracking-wider text-emerald-200">
                        Stay Updated
                    </span>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                        Get fresh ideas in your inbox
                    </h2>
                    <p className="mx-auto mb-8 max-w-lg text-lg text-emerald-100">
                        Seasonal picks, new partner stories, product drops, and useful FreshPick updates.
                    </p>

                    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                disabled={isLoading}
                                className="flex-1 rounded-full bg-white px-5 py-4 text-base text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 disabled:opacity-50"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="whitespace-nowrap rounded-full bg-gray-900 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? "Subscribing..." : "Subscribe"}
                            </Button>
                        </div>

                        <p className="text-sm text-emerald-200">
                            No spam. Unsubscribe at any time.
                        </p>
                    </form>

                    <div className="mt-12 border-t border-emerald-500/30 pt-8">
                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="group inline-flex items-center text-emerald-100 transition-colors hover:text-white"
                        >
                            <div className="mr-3 rounded-full bg-white/10 p-3 transition-colors group-hover:bg-white/20">
                                <Mail className="h-5 w-5" />
                            </div>
                            <span className="text-base font-medium">{SUPPORT_EMAIL}</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
