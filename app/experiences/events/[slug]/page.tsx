import {CultureDetail,cultureMetadata} from '@/components/discovery/CultureDetail';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){return cultureMetadata('event',(await params).slug);}
export default async function Page({params}:Props){return <CultureDetail kind="event" slug={(await params).slug}/>;}
