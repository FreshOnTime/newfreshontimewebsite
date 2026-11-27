import {notFound} from 'next/navigation';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {getDepartment,departmentPath,foodDepartments,nationwideArea} from '@/lib/foodDepartments';
import {directoryMetadata} from '@/lib/seo';
type Props={params:Promise<{department:string}>;searchParams:Promise<DirectoryParams>};
export const dynamic='force-dynamic';
export async function generateMetadata({params,searchParams}:Props){
 const d=getDepartment((await params).department);if(!d)return {robots:{index:false}};
 const q=await searchParams;
 return directoryMetadata(departmentPath(d.slug),d.title+' in Sri Lanka',d.description,{q:q.q,area:nationwideArea(q.area??q.town),specialty:q.specialty,page:q.page});
}
export default async function Page({params,searchParams}:Props){
 const d=getDepartment((await params).department);if(!d)notFound();
 return <DiscoveryDirectory mode={d.mode} params={await searchParams} path={departmentPath(d.slug)} title={d.title} description={d.description+' '+d.note} eyebrow="Explore Sri Lanka / Food departments" photo={d.image} department={d}/>;
}
export function generateStaticParams(){return foodDepartments.map(d=>({department:d.slug}));}
