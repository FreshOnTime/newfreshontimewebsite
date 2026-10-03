import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { deliveryPolicy } from '@/lib/deliveryPolicy';
export const GET=requireAdminSimple(async()=>{
  try{
    const [pendingEmail,failedEmail,overdueSubscriptions,overdueOrders]=await Promise.all([prisma.emailOutbox.count({where:{status:{in:['pending','processing']}}}),prisma.emailOutbox.count({where:{status:'failed'}}),prisma.subscription.count({where:{status:'active',nextDeliveryDate:{lt:new Date(Date.now()-3600_000)},plan:{isActive:true}}}),prisma.order.count({where:{isRecurring:true,scheduleStatus:'active',status:{not:'cancelled'},nextDeliveryAt:{lt:new Date(Date.now()-3600_000)}}})]);
    let pricing=false;try{deliveryPolicy();pricing=true;}catch{}
    return NextResponse.json({configuration:{pricing,storage:!!process.env.AZURE_STORAGE_CONNECTION_STRING,email:!!process.env.SENDGRID_API_KEY&&!!process.env.SENDGRID_FROM_EMAIL,siteUrl:!!process.env.FRONTEND_URL},queues:{pendingEmail,failedEmail,overdueSubscriptions,overdueOrders}},{headers:{'Cache-Control':'private, no-store'}});
  }catch{return NextResponse.json({error:'Operations checks failed. Check migrations and database access.'},{status:503,headers:{'Cache-Control':'private, no-store'}});}
});
