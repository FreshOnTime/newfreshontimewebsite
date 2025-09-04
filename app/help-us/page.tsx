"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HelpUsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Help Us Improve</h1>
        <p className="text-gray-700 mb-6 max-w-2xl">
          We&apos;d love your feedback. Tell us what you like, what you don&apos;t, and how we can make shopping fresher and faster.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Report an issue</h3>
            <p className="text-sm text-gray-600 mb-4">Problems with orders, checkout, or account? Let us know and we&apos;ll investigate quickly.</p>
            <Link href="/contact?type=issue" className="inline-block">
              <Button className="bg-green-600 text-white">Contact support</Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Feature requests</h3>
            <p className="text-sm text-gray-600 mb-4">Have an idea to improve Fresh Pick? Share the feature and we&apos;ll consider it for upcoming updates.</p>
            <Link href="/contact?type=suggestion" className="inline-block">
              <Button className="bg-green-600 text-white">Suggest a feature</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>Your voice matters. We review submissions weekly and respond to urgent issues faster.</p>
        </div>
      </motion.div>
    </main>
  );
}
