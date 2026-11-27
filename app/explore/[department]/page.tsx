import {notFound} from 'next/navigation';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {getDepartment,departmentPath,foodDepartments,nationwideArea} from '@/lib/foodDepartments';
import {getPageConfig} from '@/lib/sitePages';
import {departmentPageKey} from '@/lib/sitePageConfig';
import {directoryMetadata} from '@/lib/seo';
type Props={params:Promise<{department:string}>;searchParams:Promise<DirectoryParams>};
export const dynamic='force-dynamic';
export async function generateMetadata({params,searchParams}:Props){
 const d=getDepartment((await params).department);if(!d)return {robots:{index:false}};
 const q=await searchParams;const c=await getPageConfig(departmentPageKey(d.slug));
 return directoryMetadata(departmentPath(d.slug),c.seoTitle,c.seoDescription,{q:q.q,area:nationwideArea(q.area??q.town),specialty:q.specialty,page:q.page});
}
export default async function Page({params,searchParams}:Props){
 const d=getDepartment((await params).department);if(!d)notFound();const c=await getPageConfig(departmentPageKey(d.slug));
 return <DiscoveryDirectory mode={d.mode} params={await searchParams} path={departmentPath(d.slug)} title={c.title} description={c.description} eyebrow={c.eyebrow} photo={d.image} department={d}/>;
}
export function generateStaticParams(){return foodDepartments.map(d=>({department:d.slug}));}
