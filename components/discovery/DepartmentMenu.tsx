import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';
import {foodDepartments,departmentPath} from '@/lib/foodDepartments';
export function DepartmentMenu({title='Explore the world of food'}:{title?:string}){
 return <section className="fp26-guide-section fp-departments"><div className="fp26-sectionhead"><h2>{title}</h2><Link href="/explore" className="fp26-textlink">All departments <ArrowUpRight size={16}/></Link></div><p className="fp26-meta mb-4">Choose a world of food to explore, from neighbourhood cafés to local produce and gifts.</p><div className="fp-department-grid">{foodDepartments.map(d=><Link className="fp-department-card" key={d.slug} href={departmentPath(d.slug)}><div className="fp-department-image"><Image src={d.image} alt="" fill sizes="(max-width:600px) 48vw,(max-width:1000px) 30vw,25vw"/></div><div className="fp-department-copy"><h3>{d.title}</h3><p>{d.description}</p><span className="fp26-textlink">Explore <ArrowUpRight size={15}/></span></div></Link>)}</div></section>;
}
export function DepartmentNav({active}:{active?:string}){
 return <nav aria-label="Food departments" className="fp-department-nav"><Link href="/explore" aria-current={!active?'page':undefined}>All departments</Link>{foodDepartments.map(d=><Link key={d.slug} aria-current={d.slug===active?'page':undefined} href={departmentPath(d.slug)}>{d.title}</Link>)}</nav>;
}
