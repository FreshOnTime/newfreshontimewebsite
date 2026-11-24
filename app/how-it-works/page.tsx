import Link from 'next/link';
export const metadata = { title: 'How FreshPick works' };

export default function HowItWorks() {
  return <div className="editorial-wrap max-w-5xl py-12 md:py-20"><h1 className="maker-headline">From discovery to a conversation.</h1>
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <section className="rounded-xl bg-brand-cream p-6 md:p-9"><h2 className="font-serif text-3xl">Finding food</h2><ol className="my-5 list-decimal space-y-4 pl-5">
        <li>Find a maker in your town, or choose a craft that interests you.</li><li>Open an item or story to see batch dates, prices and collection details.</li><li>Use the WhatsApp button to ask the maker about availability. Confirm payment, pickup or delivery directly with them.</li>
      </ol><Link href="/makers" className="editorial-link">Explore makers</Link></section>
      <section className="rounded-xl border border-border p-6 md:p-9"><h2 className="font-serif text-3xl">Sharing your food</h2><ol className="my-5 list-decimal space-y-4 pl-5">
        <li>Create a login and submit your maker name and town for review.</li><li>Choose your public handle, WhatsApp contact and collection options in Maker Studio.</li><li>Publish an item, open a batch, or write a story with tagged items. You decide how and when to fulfil each enquiry.</li>
      </ol><Link href="/join" className="editorial-link">Start a maker page</Link></section>
    </div><Link href="/contact" className="editorial-link mt-8">Contact FreshPick</Link></div>;
}
