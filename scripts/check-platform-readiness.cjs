/* eslint-disable @typescript-eslint/no-require-imports -- standalone read-only Node preflight */
require('dotenv').config({quiet:true});
const Module=require('module'),path=require('path'),resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(__dirname,'..',name.slice(2)):name,...args);};
require('esbuild-register');
(async()=>{
 const checks={};
 try{require('../lib/deliveryPolicy').deliveryPolicy();checks.deliveryPricing=true;}catch{checks.deliveryPricing=false;}
 checks.databaseConfigured=!!process.env.DATABASE_URL;
 checks.signingSecret=(process.env.JWT_SECRET||'').length>=32;
 checks.newsletterSigningSecret=(process.env.NEWSLETTER_TOKEN_SECRET||process.env.JWT_SECRET||'').length>=32;
 try{const url=new URL(process.env.FRONTEND_URL||'');checks.siteUrl=url.protocol==='https:';}catch{checks.siteUrl=false;}
 checks.emailProvider=!!process.env.SENDGRID_API_KEY&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.SENDGRID_FROM_EMAIL||'');
 checks.productStorage=!!process.env.AZURE_STORAGE_CONNECTION_STRING;
 if(!process.argv.includes('--config-only')){
  const prisma=require('../lib/prisma').default;
  try{const migrations=await prisma.$queryRaw`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`;checks.platformMigration=migrations.some(row=>row.migration_name==='20261003050000_platform_operations'&&row.finished_at&&!row.rolled_back_at);checks.notificationReadsMigration=migrations.some(row=>row.migration_name==='20261003180000_notification_reads'&&row.finished_at&&!row.rolled_back_at);checks.noFailedMigrations=!migrations.some(row=>!row.finished_at&&!row.rolled_back_at);}
  catch{checks.platformMigration=false;checks.databaseRead=false;}
  finally{await prisma.$disconnect();}
 }
 console.log(JSON.stringify({checks,ready:Object.values(checks).every(Boolean)},null,2));
 if(!Object.values(checks).every(Boolean))process.exitCode=1;
})().catch(()=>{console.error('Readiness check failed. Check server configuration.');process.exitCode=1;});
