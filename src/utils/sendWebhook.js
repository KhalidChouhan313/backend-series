import axios from 'axios';
import { generateSignature } from './webhookSignature.js';

export const SendWebhook = async (url, payload) => {
    try {
        const signature = generateSignature(payload, process.env.WEBHOOK_SECRET);
        await axios.post(url, payload, {
            headers: {
                'x-webhook-signature': signature
            }
        });
        console.log("Webhook sent successfully to:", url);
    } catch (error) {
        console.log("Webhook send failed:", error.message);
    }
}