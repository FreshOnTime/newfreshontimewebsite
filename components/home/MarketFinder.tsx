'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cable, CalendarDays, Search, ShoppingBag, Store } from 'lucide-react';
import { occasions } from '@/lib/experiences';
import styles from './marketFinder.module.css';

const modes = [
  { name: 'Products', icon: ShoppingBag, path: '/products' },
  { name: 'Experiences', icon: CalendarDays, path: '/experiences' },
  { name: 'Shops', icon: Store, path: '/shops' },
] as const;

export default function MarketFinder() {
  const [mode, setMode] = useState<(typeof modes)[number]>(modes[0]);
  return <section className={styles.finder} aria-labelledby="finder-title">
    <div className={styles.body}>
      <h2 id="finder-title">Find your next pick.</h2>
      <div role="group" aria-label="What to find" className={styles.modes}>
        {modes.map(item => <button key={item.name} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>
          <item.icon size={16} aria-hidden="true" />{item.name}
        </button>)}
      </div>
      <form key={mode.name} action={mode.path} className={styles.form}>
        {mode.name === 'Experiences' ? <label>Occasion<select name="occasion" defaultValue=""><option value="">All occasions</option>{occasions.map(name => <option key={name}>{name}</option>)}</select></label> :
          <label>{mode.name === 'Products' ? 'Product' : 'Shop or host'}<input name={mode.name === 'Products' ? 'search' : 'q'} maxLength={120} placeholder={mode.name === 'Products' ? 'Try cake, coffee or bread' : 'Search by name'} /></label>}
        {mode.name === 'Products' && <>
          <label className={styles.budget}>Budget (LKR)<input name="maxPrice" type="number" min="0" step="0.01" placeholder="Any price" /></label>
          <input type="hidden" name="inStock" value="true" />
        </>}
        <button className={styles.submit}><Search size={16} aria-hidden="true" />Find {mode.name.toLowerCase()}</button>
      </form>
    </div>
    <aside className={styles.agent}>
      <Cable size={24} aria-hidden="true" />
      <h3>Shop with your assistant</h3>
      <p>Connect an MCP assistant to prepare a bag or reserve places with a host using the permissions you choose.</p>
      <Link href="/profile/agent-access">Connect an assistant <ArrowRight size={16} aria-hidden="true" /></Link>
    </aside>
  </section>;
}
