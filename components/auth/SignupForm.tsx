import Link from "next/link";
import { User, Store } from "lucide-react";

export function SignupForm() {
  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="relative hidden lg:block h-full bg-zinc-900">
        <div className="absolute inset-0 bg-[url('/bgs/landing-page-bg-1.jpg')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
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
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-16 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-lg">
          <div className="text-center lg:text-left mb-12">
            <h1 className="text-4xl font-serif font-bold text-zinc-900 dark:text-white mb-4">
              Get Started
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Choose your account type to proceed
            </p>
          </div>

          <div className="space-y-6">
            {/* Customer Option */}
            <Link href="/auth/signup/customer" className="block group">
              <div className="p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    Customer
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Shop for fresh produce & track orders
                  </p>
                </div>
              </div>
            </Link>

            {/* Supplier Option */}
            <Link href="/auth/signup/supplier" className="block group">
              <div className="p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all duration-300 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Store size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    Supplier
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    List products & grow your business
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center lg:text-left text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
