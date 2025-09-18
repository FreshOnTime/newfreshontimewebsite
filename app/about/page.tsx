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
            <p className="text-gray-700 mb-4">Freshpick.lk is an innovative online grocery platform that caters to the needs of Sri Lankan consumers by offering a convenient and efficient way to shop for groceries from the comfort of their homes. It provides a wide range of products, from fresh produce and dairy items to pantry staples and household essentials, ensuring that customers have access to everything they need for their daily lives. With an intuitive and user-friendly website, Freshpick.lk makes it easy for users to browse through categories, select their desired items, and have them delivered directly to their doorstep. This service not only saves time but also aids in maintaining social distancing practices, making it an ideal choice for those seeking safety and convenience. By focusing on quality, variety, and customer satisfaction, Freshpick.lk is redefining the grocery shopping experience in Sri Lanka.</p>
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
