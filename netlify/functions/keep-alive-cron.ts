import { schedule } from '@netlify/functions';

export const handler = schedule('*/10 * * * *', async (event) => {
    const websiteUrl = process.env.URL || 'https://freshpick.lk';
    const keepAliveUrl = `${websiteUrl}/api/cron/keep-alive`;

    console.log(`Pinging ${keepAliveUrl} to keep the server awake...`);

    try {
        const response = await fetch(keepAliveUrl);
        const data = await response.json();
        console.log('Keep-alive ping successful:', data);

        return {
            statusCode: 200,
        };
    } catch (error) {
        console.error('Keep-alive ping failed:', error);
        return {
            statusCode: 500,
        };
    }
});
