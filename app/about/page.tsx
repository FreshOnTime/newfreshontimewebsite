"use client";

import React from "react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { Truck, Clock, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <PremiumPageHeader
        title="About Fresh Pick"
        subtitle="Freshness Delivered to Your Doorstep."
        backgroundImage="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Headline & Story */}
        <div className="prose prose-lg mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Freshness Delivered to Your Doorstep.</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Story</h3>
          <p className="text-gray-600 leading-relaxed">
            Welcome to <span className="font-semibold text-primary">Fresh Pick</span>, your new partner in convenient, quality living.
            We started with a simple goal: to take the hassle out of grocery shopping in Colombo without compromising on quality.
            We know that in the bustle of city life, finding time to visit the market can be a challenge. That’s why we bring the market to you.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Promise</h3>
          <p className="text-gray-600 leading-relaxed">
            We don't just deliver groceries; we deliver freshness. Whether it's farm-fresh vegetables, premium meats, or your daily pantry staples,
            every item is hand-picked by our team as if we were shopping for our own families.
            If it’s not good enough for our table, it’s not good enough for your doorstep.
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Fresh Pick?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sourced Daily</h4>
              <p className="text-sm text-gray-600">We work directly with local suppliers to ensure peak freshness.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Time-Saving</h4>
              <p className="text-sm text-gray-600">Skip the traffic and the queues. Order from your phone and relax.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h4>
              <p className="text-sm text-gray-600">Not happy with an item? We have a fair and easy replacement policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
