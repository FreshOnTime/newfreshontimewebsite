"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About Fresh Pick</h1>
            <p className="text-gray-700 mb-4">Fresh Pick started with a simple idea: make fresh, high-quality groceries available to every doorstep. We partner with local farmers and trusted suppliers to bring produce, staples, and specialty items to your kitchen.</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
              <li>Locally sourced ingredients</li>
              <li>Strict quality checks</li>
              <li>Fast, reliable delivery windows</li>
            </ul>
            <p className="text-sm text-gray-600">Want to know more? Reach out via our contact page or visit our store.</p>
          </div>

          <div className="w-full h-64 relative rounded-lg overflow-hidden shadow-lg">
            <Image src="/bgs/landing-page-bg-1.jpg" alt="About Fresh Pick" fill className="object-cover" />
          </div>
        </div>
      </motion.div>
    </main>
  );
}
