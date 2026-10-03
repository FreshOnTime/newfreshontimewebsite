import type { Config } from '@netlify/functions';
import { processEmailOutbox } from '../../lib/services/emailOutboxService';
const handler = async () => { const result=await processEmailOutbox(); console.info(JSON.stringify(result)); return Response.json(result); };
export default handler;
export const config: Config = { schedule: '* * * * *' };
