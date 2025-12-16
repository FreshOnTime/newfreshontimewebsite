"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "homepage" }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Welcome to Fresh Pick! Check your email for exclusive deals.");
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
        <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 md:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <span className="text-emerald-200 text-sm font-semibold tracking-wider uppercase mb-4 block">
                        Stay Updated
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                        Get fresh deals in your inbox
                    </h2>
                    <p className="text-lg text-emerald-100 mb-8 max-w-lg mx-auto">
                        Join over 10,000 happy customers who save with our weekly deals and
                        recipes
                    </p>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                disabled={isLoading}
                                className="flex-1 px-5 py-4 rounded-full text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-white/30 bg-white shadow-lg disabled:opacity-50"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all whitespace-nowrap disabled:opacity-50"
                            >
                                {isLoading ? "Subscribing..." : "Subscribe"}
                            </Button>
                        </div>

                        <p className="text-sm text-emerald-200">
                            No spam, unsubscribe at any time
                        </p>
                    </form>

                    <div className="mt-12 pt-8 border-t border-emerald-500/30">
                        <a
                            href="mailto:hello@freshpick.lk"
                            className="inline-flex items-center text-emerald-100 hover:text-white transition-colors group"
                        >
                            <div className="bg-white/10 rounded-full p-3 mr-3 group-hover:bg-white/20 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <span className="text-base font-medium">hello@freshpick.lk</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
