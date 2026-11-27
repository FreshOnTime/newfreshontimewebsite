import {notFound} from 'next/navigation';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {getDepartment,departmentPath,foodDepartments,nationwideArea} from '@/lib/foodDepartments';
import {getPageConfig} from '@/lib/sitePages';
import {departmentPageKey} from '@/lib/sitePageConfig';
import {directoryMetadata,serializeJsonLd,breadcrumbJsonLd} from '@/lib/seo';
import {collectionJsonLd,departmentAnswers} from '@/lib/searchDiscovery';
import Link from 'next/link';
type Props={params:Promise<{department:string}>;searchParams:Promise<DirectoryParams>};
export const dynamic='force-dynamic';
export async function generateMetadata({params,searchParams}:Props){
 const d=getDepartment((await params).department);if(!d)return {robots:{index:false}};
 const q=await searchParams;const c=await getPageConfig(departmentPageKey(d.slug));
 return directoryMetadata(departmentPath(d.slug),c.seoTitle,c.seoDescription,{q:q.q,area:nationwideArea(q.area??q.town),specialty:q.specialty,page:q.page});
}
export default async function Page({params,searchParams}:Props){
 const d=getDepartment((await params).department);if(!d)notFound();const c=await getPageConfig(departmentPageKey(d.slug));
 const q=await searchParams;const path=departmentPath(d.slug);const answer=departmentAnswers[d.slug];const meta=directoryMetadata(path,c.seoTitle,c.seoDescription,{q:q.q,area:q.area??q.town,specialty:q.specialty,page:q.page});const primary=meta.alternates?.canonical===undefined?false:!meta.robots&&(!q.page||q.page==='1');
 return <><DiscoveryDirectory mode={d.mode} params={q} path={path} title={c.title} description={c.description} eyebrow={c.eyebrow} photo={d.image} department={d}/>{primary&&answer&&<section className="fp26-shell fp-search-answer"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(collectionJsonLd(path,c.title,c.description))}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbJsonLd([{name:'Explore',path:'/explore'},{name:d.title,path}]))}}/><h2>{answer.question}</h2><p>{answer.answer}</p><nav aria-label="Related food discovery" className="fp26-directory-tools">{answer.links.map(l=><Link key={l.path} href={l.path}>{l.name}</Link>)}</nav></section>}</>;
}
export function generateStaticParams(){return foodDepartments.map(d=>({department:d.slug}));}
