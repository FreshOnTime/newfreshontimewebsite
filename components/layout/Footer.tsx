"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#051c14] text-white border-t border-white/5">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Image
                src="/fresh-pick.svg"
                alt="Fresh Pick"
                width={160}
                height={160}
                className="brightness-0 invert opacity-90"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Curating the finest harvest for your table. Experience the pinnacle of freshness with our premium delivery service.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-6 text-accent">Concierge</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-accent transition-colors">Collection</Link></li>
              <li><Link href="/deals" className="text-gray-400 hover:text-accent transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Exclusive Offers</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-accent transition-colors">How It Works</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-accent transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-6 text-accent">The Market</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/categories/fresh-produce" className="text-gray-400 hover:text-accent transition-colors">Fresh Harvest</Link></li>
              <li><Link href="/categories/dairy-eggs" className="text-gray-400 hover:text-accent transition-colors">Artisan Dairy</Link></li>
              <li><Link href="/categories/meat-seafood" className="text-gray-400 hover:text-accent transition-colors">Premium Cuts</Link></li>
              <li><Link href="/categories/pantry-staples" className="text-gray-400 hover:text-accent transition-colors">Global Pantry</Link></li>
              <li><Link href="/categories/bakery" className="text-gray-400 hover:text-accent transition-colors">Fresh Bakery</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-6 text-accent">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:hello@freshpick.lk" className="hover:text-white transition-colors">
                  hello@freshpick.lk
                </a>
              </li>
              <li className="flex items-start text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 mt-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="mt-1.5">
                  The Arcade, Independence Square<br />
                  Colombo 07, Sri Lanka
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wider">
            <p>&copy; 2025 Fresh Pick. Crafted for Excellence.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-accent transition-colors">Refunds</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
