"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/fresh-pick.svg"
                alt="Fresh Pick"
                width={180}
                height={180}
                className="text-white"
              />

            </div>
            <p className="text-gray-400 text-sm">
              The freshest groceries delivered to your door. Quality you can trust,
              convenience you&apos;ll love.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-accent transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-accent transition-colors">
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-accent transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-accent transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-accent transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-accent transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories/fresh-produce" className="text-gray-400 hover:text-accent transition-colors">
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link href="/categories/dairy-eggs" className="text-gray-400 hover:text-accent transition-colors">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link href="/categories/meat-seafood" className="text-gray-400 hover:text-accent transition-colors">
                  Meat & Seafood
                </Link>
              </li>
              <li>
                <Link href="/categories/pantry-staples" className="text-gray-400 hover:text-accent transition-colors">
                  Pantry Staples
                </Link>
              </li>
              <li>
                <Link href="/categories/bakery" className="text-gray-400 hover:text-accent transition-colors">
                  Bakery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <a href="mailto:hello@freshpick.lk" className="hover:text-accent transition-colors">
                  hello@freshpick.lk
                </a>
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span>
                  Headquarters: Colombo, Sri Lanka
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2025 Fresh Pick. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="hover:text-accent transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
