import Link from 'next/link';
import {SavePick} from '@/components/makers/SavedPicks';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import {ArrowUpRight} from 'lucide-react';
import prisma from '@/lib/prisma';
import {publicProspectWhere,publicProspectSelect} from '@/lib/discovery';
import {EditorialHeader} from '@/components/discovery/Editorial';
import {SocialLinks} from '@/components/discovery/Directory';
import {pageMetadata,privateMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
const find=cache(async(id:string)=>{if(!/^[-a-z0-9]{1,120}$/.test(id))return null;return prisma.discoveryProspect.findFirst({where:{...publicProspectWhere,id},select:publicProspectSelect})});
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await find(id);return b?pageMetadata({title:b.name,path:'/places/'+id,description:b.category+' discovery profile on FreshPick.'}):privateMetadata;}
export default async function Place({params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await find(id);if(!b)notFound();return <div className="fp26-shell pb-12"><nav className="fp26-pagination" aria-label="Breadcrumb"><Link href="/discover">Discover</Link><span>/ {b.category}</span></nav><EditorialHeader eyebrow={b.category} title={b.name} description={b.area||'Sri Lanka'}/>
 <div className="mb-4"><SavePick href={"/places/"+b.id} title={b.name} kind="Business"/></div><div className="fp26-profilegrid"><section><h2 className="editorial-title">What they offer</h2>{b.products?<p className="mt-4 leading-7">{b.products}</p>:<p className="mt-4">Contact the business for details of its current offering.</p>}<p className="fp26-meta mt-5">Information reviewed {b.reviewedAt?.toLocaleDateString('en-LK',{timeZone:'Asia/Colombo'})}. This is an independent profile, not an owner-claimed listing or endorsement.</p><div className="mt-6"><SocialLinks business={b}/></div></section><aside><h2>Contact the business</h2><p>Use its official channels to confirm current prices, availability, menus and arrangements. FreshPick does not process orders or reservations.</p><Link href="/contact" className="fp26-textlink">Suggest a correction <ArrowUpRight size={16}/></Link></aside></div>
 <div className="fp26-empty"><div><h2>Own this business?</h2><p>Request a correction or discuss adding an owner-managed page.</p></div><Link href="/for-businesses" className="fp26-textlink">For businesses <ArrowUpRight size={16}/></Link></div></div>}