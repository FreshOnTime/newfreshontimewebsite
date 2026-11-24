import Image from 'next/image';
import Link from 'next/link';
export const metadata = { title: 'About FreshPick' };
export default function About() {
  return <section className="maker-hero"><div className="maker-hero-copy">
    <h1 className="maker-headline">A closer look at local food.</h1>
    <p className="my-6 max-w-lg leading-8">A baker opens a Saturday batch. A grower shares what’s in season. A home cook tells the story behind a family recipe. FreshPick gives each of them a page you can come back to.</p>
    <p className="mb-6 max-w-lg leading-8">Browse by town or craft and speak directly to the person behind the food. Each maker sets their own availability, price and pickup or delivery arrangements.</p>
    <Link className="maker-button" href="/makers">Meet the makers</Link>
  </div><div className="maker-hero-photo"><Image fill sizes="(max-width:767px) 100vw, 55vw" src="/images/editorial/sri-lankan-fields.webp" alt="Fields along the road to Nuwara Eliya, Sri Lanka" className="object-cover"/></div></section>;
}
