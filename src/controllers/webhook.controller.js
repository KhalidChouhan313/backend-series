import AsyncHandler from "express-async-handler";
import { generateSignature } from "../utils/webhookSignature.js";

export const handlePaymentWebhook = AsyncHandler(async (req, res) => {
    const recivedSignature = req.headers["x-webhook-signature"];
    const expectedSignature = generateSignature(req.body, process.env.WEBHOOK_SECRET);

    if (recivedSignature !== expectedSignature) {
        return res.status(400).json({ error: "Invalid signature" });
    }
    console.log("Verified webhook received:", req.body);

    const { event, data } = req.body;

    if (event === "payment.success") {
        console.log(`Payment successful for order: ${data.orderId}`);
    }
    res.status(200).json({ received: true });
});