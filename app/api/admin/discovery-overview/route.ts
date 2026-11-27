import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {requireAdminSimple} from '@/lib/middleware/adminAuth';
import {publicMakerWhere} from '@/lib/makers';
import {publicProspectWhere} from '@/lib/discovery';
export const dynamic='force-dynamic';
export const GET=requireAdminSimple(async()=>{
 const checks={
  pendingApplications:()=>prisma.supplier.count({where:{applicationStatus:'pending'}}),
  publicBusinesses:()=>prisma.supplier.count({where:publicMakerWhere}),
  publicOfferings:()=>prisma.makerItem.count({where:{published:true,supplier:publicMakerWhere}}),
  reviewedListings:()=>prisma.discoveryProspect.count({where:publicProspectWhere}),
  pendingListings:()=>prisma.discoveryProspect.count({where:{reviewStatus:'pending'}}),
  publishedContent:()=>prisma.discoveryContent.count({where:{published:true,publishedAt:{not:null}}}),
  draftContent:()=>prisma.discoveryContent.count({where:{published:false}}),
  publishedArticles:()=>prisma.blog.count({where:{published:true,isDeleted:false,OR:[{supplierId:null},{supplier:publicMakerWhere}]}}),
  members:()=>prisma.user.count({where:{role:'customer',isBanned:false}}),
  openEnquiries:()=>prisma.contactEnquiry.count({where:{status:{in:['new','in_progress']}}}),
  pendingLive:()=>prisma.liveVendor.count({where:{approval:'pending'}}),
  activeLive:()=>prisma.liveVendor.count({where:{approval:'approved',servingUntil:{gt:new Date()},supplier:publicMakerWhere}}),
  authMailWaiting:()=>prisma.emailOutbox.count({where:{subject:{in:['Verify your account','Reset your password']},status:{in:['pending','processing']}}}),
  authMailFailed:()=>prisma.emailOutbox.count({where:{subject:{in:['Verify your account','Reset your password']},status:'failed'}}),
  managedAccounts:()=>prisma.user.count({where:{supabaseAuthId:{not:null}}}),
 };
 const entries=await Promise.all(Object.entries(checks).map(async([key,check])=>{try{return [key,await check()] as const;}catch{return [key,null] as const;}}));
 return NextResponse.json({metrics:Object.fromEntries(entries),auth:{managedEnabled:process.env.FRESHPICK_SUPABASE_AUTH==='true',legacyMailConfigured:!!process.env.SENDGRID_API_KEY&&!!process.env.SENDGRID_FROM_EMAIL}},{headers:{'Cache-Control':'private, no-store'}});
});
