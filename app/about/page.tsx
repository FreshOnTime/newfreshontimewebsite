import Link from 'next/link';
import { CraftShelf, PageBand } from '@/components/makers/Edition';
export const metadata = { title: 'About FreshPick' };
export default function About() {
  return <div className="edition-about">
    <PageBand title="People make the market." intro="FreshPick brings the people behind Sri Lanka’s food into view." image="/images/editorial/sri-lankan-fields.webp" alt="Cultivated fields along the road to Nuwara Eliya"/>
    <section className="fp-about editorial-wrap" data-studio-chapter><h2>From a single kitchen<br/>to a whole island.</h2><div>
      <p>A baker opens a Saturday batch. A grower shares what’s in season. A home cook writes down a family recipe. Every maker gets a page for their food and the stories that go with it.</p>
      <p>You can find them by town or craft, save something for later and ask a question directly on WhatsApp. The maker sets the price, availability and pickup or delivery arrangements.</p>
      <Link className="fp-inline" href="/join">Create your maker page</Link></div></section><div className="fp-paper"><CraftShelf/></div>
  </div>;
}
