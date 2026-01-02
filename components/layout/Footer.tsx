"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-white/5">
      {/* Newsletter Section */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg text-center md:text-left">
            <h3 className="font-serif text-3xl md:text-4xl italic mb-3 text-white">Join the Inner Circle</h3>
            <p className="text-zinc-400 font-light">Receive exclusive invitations to seasonal harvests and private reserves.</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <input
              type="email"
              placeholder="Email Address"
              className="bg-white/5 border border-white/10 rounded-full px-6 py-4 w-full md:w-80 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all font-light"
            />
            <button className="bg-white text-zinc-950 px-8 py-4 rounded-full font-medium tracking-wide hover:bg-amber-200 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold tracking-tight text-white">
                  Fresh<span className="italic text-emerald-500">Pick</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-emerald-900/60 text-zinc-500">
                  Colombo
                </span>
              </div>
            </Link>
            <p className="text-zinc-400 font-light leading-relaxed">
              Curating the finest harvest for those who appreciate the extraordinary.
              Elevating the daily ritual of nourishment into an art form.
            </p>
            <div className="flex space-x-4 pt-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-emerald-900/30 hover:text-emerald-400 transition-all duration-300 border border-white/5 hover:border-emerald-500/30">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="font-serif text-lg text-white mb-8 italic">Collections</h4>
              <ul className="space-y-4">
                {['Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples', 'Bakery', 'Beverages'].map((item) => (
                  <li key={item}>
                    <Link href="/products" className="text-zinc-500 hover:text-emerald-400 transition-colors text-sm tracking-wide font-light flex items-center group">
                      <span className="w-0 group-hover:w-2 h-[1px] bg-emerald-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg text-white mb-8 italic">World of Fresh</h4>
              <ul className="space-y-4">
                {[
                  { name: 'Our Story', href: '/about' },
                  { name: 'The Growers', href: '/about' },
                  { name: 'Sustainability', href: '/about' },
                  { name: 'Private Membership', href: '/subscriptions' },
                  { name: 'Concierge Services', href: '/contact' },
                  { name: 'Journal', href: '/blog' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-zinc-500 hover:text-emerald-400 transition-colors text-sm tracking-wide font-light flex items-center group">
                      <span className="w-0 group-hover:w-2 h-[1px] bg-emerald-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg text-white mb-8 italic">Client Care</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-zinc-500 font-light text-sm">
                  <MapPin className="w-4 h-4 mt-1 shrink-0 text-emerald-600" />
                  <span>Available throughout<br />Greater Colombo</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-500 font-light text-sm">
                  <Mail className="w-4 h-4 shrink-0 text-emerald-600" />
                  <a href="mailto:concierge@freshpick.lk" className="hover:text-white transition-colors">concierge@freshpick.lk</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-zinc-500">
            <p>&copy; {new Date().getFullYear()} FreshPick. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-[#d4af37] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#d4af37] transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-[#d4af37] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
