import {CultureDetail,cultureMetadata} from '@/components/discovery/CultureDetail';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){return cultureMetadata('tradition',(await params).slug);}
export default async function Page({params}:Props){return <CultureDetail kind="tradition" slug={(await params).slug}/>;}
