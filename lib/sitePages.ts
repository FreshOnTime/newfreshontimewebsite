import prisma from '@/lib/prisma';
import {pageDefaults,validatePageConfig,type PageKey} from '@/lib/sitePageConfig';
export async function getPageConfig(key:PageKey){
 try{const row=await prisma.sitePageContent.findUnique({where:{key},select:{live:true,publishedAt:true}});return row?.publishedAt?validatePageConfig(key,row.live)||pageDefaults[key]:pageDefaults[key];}catch(error){console.error('Site page configuration unavailable',key,error);return pageDefaults[key];}
}
