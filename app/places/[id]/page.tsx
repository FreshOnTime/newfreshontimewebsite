import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowUpRight} from 'lucide-react';
import prisma from '@/lib/prisma';
import {publicProspectWhere,publicProspectSelect} from '@/lib/discovery';
import {EditorialHeader} from '@/components/discovery/Editorial';
import {SocialLinks} from '@/components/discovery/Directory';
import {pageMetadata,privateMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
async function find(id:string){if(!/^[-a-z0-9]{1,120}$/.test(id))return null;return prisma.discoveryProspect.findFirst({where:{...publicProspectWhere,id},select:publicProspectSelect})}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await find(id);return b?pageMetadata({title:b.name,path:'/places/'+id,description:b.category+' discovery profile on FreshPick.'}):privateMetadata;}
export default async function Place({params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await find(id);if(!b)notFound();return <div className="fp26-shell pb-12"><EditorialHeader eyebrow={b.category} title={b.name} description={b.area||'Sri Lanka'}/><div className="fp26-notice">Independent discovery profile. This is not an owner-claimed listing or a FreshPick endorsement. Confirm current information directly with the business.</div><div className="fp26-panel"><h2>Discover the business</h2>{b.products&&<p className="mb-4">{b.products}</p>}<p className="fp26-meta mb-4">Reviewed {b.reviewedAt?.toLocaleDateString('en-LK',{timeZone:'Asia/Colombo'})}</p><SocialLinks business={b}/><p className="mt-4">Prices, menus, availability and bookings are arranged directly with the business.</p></div><section className="fp26-empty"><h2 className="text-3xl">Own this business?</h2><p>Get in touch to correct or remove this profile, or discuss adding an owner-managed page.</p><Link href="/contact" className="fp26-action">Contact FreshPick <ArrowUpRight size={16}/></Link></section><Link className="fp26-textlink" href="/discover">Back to discovery</Link></div>}
