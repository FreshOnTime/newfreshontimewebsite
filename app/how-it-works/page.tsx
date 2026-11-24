import Link from 'next/link';
import { PageBand } from '@/components/makers/Edition';
export const metadata = { title: 'How FreshPick works' };
export default function HowItWorks() {
  return <><PageBand title="How FreshPick works." intro="A place to find local food and a direct line to the person who makes it." image="/images/editorial/restaurant-kitchen.webp" alt="Cooks at work in a kitchen"/>
    <div className="fp-process editorial-wrap">
      <section><h2>For food lovers</h2><ol>
        <li><strong>Look nearby.</strong> Browse a town, a craft or a maker you already know.</li>
        <li><strong>Open an item.</strong> Read the details, check the batch date and save it for later.</li>
        <li><strong>Message the maker.</strong> Agree on the quantity, price and pickup or delivery on WhatsApp.</li>
      </ol><Link className="maker-button" href="/makers">Explore makers</Link></section>
      <section><h2>For makers</h2><ol>
        <li><strong>Introduce yourself.</strong> Create a login and send your maker name and town for review.</li>
        <li><strong>Open your page.</strong> Add your WhatsApp number, your food and your collection options.</li>
        <li><strong>Share what’s next.</strong> Open a batch or publish a story with tagged items. Handle each enquiry directly.</li>
      </ol><Link className="maker-button" href="/join">Start a maker page</Link></section>
    </div></>;
}
