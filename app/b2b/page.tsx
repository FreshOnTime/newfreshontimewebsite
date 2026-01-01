import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Truck, Clock, ShieldCheck, Users, ChefHat, Phone, Mail, ArrowRight, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/home/AnimatedSection';

export const metadata: Metadata = {
    title: 'Culinary Partners | Fresh Pick B2B',
    description: 'The preferred fresh produce partner for Colombo\'s finest restaurants and hotels. Consistent quality, reliable delivery, and premium sourcing.',
};

const stats = [
    { label: 'Quality Grade', value: 'A+' },
    { label: 'On-Time Delivery', value: '100%' },
    { label: 'Farm to Kitchen', value: '<12h' },
];

const offerings = [
    {
        title: 'Premium Vegetables',
        desc: 'Heirloom, organic, and exotic varieties sourced daily.',
        image: 'https://images.unsplash.com/photo-1566842600175-97dca489844f?q=80&w=2574&auto=format&fit=crop'
    },
    {
        title: 'Fresh Fruits',
        desc: 'Seasonal local delights and premium imported selections.',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2574&auto=format&fit=crop'
    },
    {
        title: 'Dairy & Eggs',
        desc: 'Farm-fresh eggs and artisanal dairy products.',
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=2574&auto=format&fit=crop'
    },
];

export default function B2BPage() {
    return (
        <div className="min-h-screen bg-transparent text-zinc-900">
            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2574&auto=format&fit=crop"
                        alt="Fine Dining Restaurant"
                        fill
                        className="object-cover brightness-[0.25]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
                </div>

                <div className="container mx-auto px-4 relative z-10 pt-20">
                    <AnimatedSection className="max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full mb-8">
                            <ChefHat className="w-5 h-5 text-[#d4af37]" />
                            <span className="text-sm font-medium tracking-wide uppercase text-zinc-200">The Chef's Choice</span>
                        </div>

                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8 leading-[0.9] tracking-tight text-white drop-shadow-2xl">
                            Culinary Excellence<br />
                            <span className="text-[#d4af37] italic font-light">Begins Here</span>
                        </h1>

                        <p className="text-xl md:text-2xl font-light text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-12">
                            Transforming the supply chain for Colombo's finest kitchens. Uncompromising quality, delivered with precision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Button size="lg" className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-full px-8 h-14 text-lg font-medium shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105" asChild>
                                <a href="#contact">Request Partnership</a>
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg bg-white/5 backdrop-blur-sm" asChild>
                                <a href="tel:+94771234567">
                                    <Phone className="w-5 h-5 mr-2" />
                                    +94 77 123 4567
                                </a>
                            </Button>
                        </div>
                    </AnimatedSection>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white to-transparent" />
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-zinc-900 border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat, i) => (
                            <AnimatedSection key={i} delay={i * 0.1} className="text-center">
                                <span className="block text-4xl md:text-5xl font-serif text-[#d4af37] mb-2">{stat.value}</span>
                                <span className="text-zinc-400 text-sm uppercase tracking-widest font-medium">{stat.label}</span>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Process */}
            <section className="py-24 bg-[#fafaf9] relative">
                <div className="container mx-auto px-4">
                    <AnimatedSection className="text-center mb-16">
                        <span className="text-[#0c2f21] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Process</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-[#0c2f21] mb-6">Seamless Integration</h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto">We integrate effortlessly into your kitchen's workflow.</p>
                    </AnimatedSection>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-zinc-200 -z-10" />

                        {[
                            { step: '01', title: 'Consultation', desc: 'We discuss your menu and volume requirements.' },
                            { step: '02', title: 'Sample Box', desc: 'Receive a curated box to test our quality.' },
                            { step: '03', title: 'Scheduling', desc: 'Set up your delivery windows and standing orders.' },
                            { step: '04', title: 'Delivery', desc: 'Daily deliveries begin, straight to your kitchen.' }
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.2}>
                                <div className="bg-white p-6 relative">
                                    <div className="w-24 h-24 bg-[#0c2f21] text-[#d4af37] rounded-full flex items-center justify-center text-2xl font-serif mb-6 mx-auto border-4 border-white shadow-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="font-serif text-xl text-center mb-3 text-zinc-900">{item.title}</h3>
                                    <p className="text-center text-zinc-500 text-sm">{item.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Promise - Text/Image Split */}
            <section className="py-24 md:py-32 relative overflow-hidden bg-[#fafaf9]">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <AnimatedSection>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[#d4af37]/20 blur-3xl rounded-full opacity-20" />
                                <span className="text-[#0c2f21] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Our Standard</span>
                                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#0c2f21] mb-8 leading-tight">
                                    Consistency is <span className="italic text-[#d4af37]">Everything</span>
                                </h2>
                                <p className="text-lg text-zinc-600 mb-8 leading-relaxed font-light">
                                    In a high-pressure kitchen, you cannot compromise on your ingredients. We understand that a missed delivery or wilted produce isn't just an inconvenience—it's a reputation risk.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        'Grade-A produce hand-selected by experts',
                                        'Temperature-controlled logistics fleet',
                                        'Emergency top-up deliveries available',
                                        'Dedicated key account manager'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                                            </div>
                                            <span className="text-zinc-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedSection>
                        <AnimatedSection delay={0.2} className="relative">
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group">
                                <Image
                                    src="https://images.unsplash.com/photo-1577106263724-2c8e03bfe9f4?q=80&w=2574&auto=format&fit=crop"
                                    alt="Chef plating dish"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Offerings Carousel */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <AnimatedSection className="text-center mb-16">
                        <h2 className="font-serif text-4xl md:text-5xl text-[#0c2f21] mb-6">The Pantry</h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto">Providing a comprehensive range of essentials for the modern professional kitchen.</p>
                    </AnimatedSection>

                    <div className="grid md:grid-cols-3 gap-8">
                        {offerings.map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.1}>
                                <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="font-serif text-3xl text-white mb-2">{item.title}</h3>
                                        <p className="text-zinc-300 font-light text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Island */}
            <section id="contact" className="py-24 md:py-32 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-5">
                        <div className="lg:col-span-2 bg-[#0c2f21] text-white p-12 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />

                            <div>
                                <h3 className="font-serif text-3xl mb-6">Partner With Us</h3>
                                <p className="text-emerald-100/80 mb-12 font-light">
                                    Fill out the form and our head of partnerships will contact you within 24 hours to schedule a tasting.
                                </p>

                                <div className="space-y-6">
                                    <a href="mailto:b2b@freshpick.lk" className="flex items-center gap-4 text-emerald-100 hover:text-white transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <span>b2b@freshpick.lk</span>
                                    </a>
                                    <a href="tel:+94771234567" className="flex items-center gap-4 text-emerald-100 hover:text-white transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <span>+94 77 123 4567</span>
                                    </a>
                                </div>
                            </div>

                            <div className="pt-12">
                                <div className="text-sm text-emerald-100/60 uppercase tracking-widest font-bold mb-2">Office</div>
                                <address className="not-italic text-emerald-100">
                                    123 Galle Road,<br />Colombo 03, Sri Lanka
                                </address>
                            </div>
                        </div>

                        <div className="lg:col-span-3 p-12 bg-white">
                            <form className="space-y-6" action="mailto:b2b@freshpick.lk" method="post" encType="text/plain">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Business Name</label>
                                        <input type="text" className="w-full bg-zinc-50 border-b border-zinc-200 p-3 focus:outline-none focus:border-[#0c2f21] transition-colors" placeholder="e.g. The Grand Hotel" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contact Person</label>
                                        <input type="text" className="w-full bg-zinc-50 border-b border-zinc-200 p-3 focus:outline-none focus:border-[#0c2f21] transition-colors" placeholder="Your Name" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                                        <input type="email" className="w-full bg-zinc-50 border-b border-zinc-200 p-3 focus:outline-none focus:border-[#0c2f21] transition-colors" placeholder="chef@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Phone Number</label>
                                        <input type="tel" className="w-full bg-zinc-50 border-b border-zinc-200 p-3 focus:outline-none focus:border-[#0c2f21] transition-colors" placeholder="+94..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estimated Weekly Volume</label>
                                    <select className="w-full bg-zinc-50 border-b border-zinc-200 p-3 focus:outline-none focus:border-[#0c2f21] transition-colors">
                                        <option>Less than 100kg</option>
                                        <option>100kg - 500kg</option>
                                        <option>500kg - 1000kg</option>
                                        <option>More than 1000kg</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Message</label>
                                    <textarea rows={4} className="w-full bg-zinc-50 border-b border-zinc-200 p-3 focus:outline-none focus:border-[#0c2f21] transition-colors resize-none" placeholder="Tell us about your requirements..."></textarea>
                                </div>

                                <Button size="lg" className="w-full bg-[#0c2f21] text-white hover:bg-[#061a12] h-14 text-lg font-medium rounded-xl mt-4">
                                    Submit Application
                                </Button>
                                <p className="text-xs text-center text-zinc-400 mt-4">
                                    By submitting, you agree to our Terms of Service. Your data is secure.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
