import Link from "next/link";
import { User, Store } from "lucide-react";

export function SignupForm() {
  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="relative hidden lg:block h-full bg-zinc-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
            alt="Fresh Produce"
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-16 text-white">
          <h2 className="text-5xl font-serif font-bold mb-6">
            Join the <span className="text-emerald-400">Community</span>
          </h2>
          <p className="text-zinc-300 text-xl leading-relaxed max-w-md">
            Whether you're looking for the freshest produce or ready to grow your business, we have a place for you.
          </p>
        </div>
      </div>

      {/* Right Side - Selection */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-lg">
          <div className="text-center lg:text-left mb-12">
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4">
              Get Started
            </h1>
            <p className="text-zinc-500 text-lg">
              Choose your account type to proceed
            </p>
          </div>

          <div className="space-y-6">
            {/* Customer Option */}
            <Link href="/auth/signup/customer" className="block group">
              <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1 group-hover:text-emerald-700 transition-colors">
                    Customer
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    Shop for fresh produce & track orders
                  </p>
                </div>
              </div>
            </Link>

            {/* Supplier Option */}
            <Link href="/auth/signup/supplier" className="block group">
              <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-amber-500 hover:bg-amber-50/30 transition-all duration-300 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Store size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1 group-hover:text-amber-700 transition-colors">
                    Supplier
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    List products & grow your business
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center lg:text-left text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
