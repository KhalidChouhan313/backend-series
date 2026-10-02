import cron from "node-cron";
import Todo from "../models/Todo.model.js";
import { SendWebhook } from "../utils/sendWebhook.js";
import { clearCache } from "../middlewares/cache.middleware.js";

export const startTodoJobs = () => {
    // Runs once a month: 10th at 00:00 (Asia/Karachi)
    cron.schedule("0 0 10 * *", async () => {
        try {
            const dueTodos = await Todo.find({
                dueDate: { $lte: new Date() },
                reminderSent: { $ne: true },
                completed: false,
            });
            console.log("Due todos found:", dueTodos.length);

            for (const todo of dueTodos) {
                const updated = await Todo.findOneAndUpdate(
                    {
                        _id: todo._id,
                        reminderSent: { $ne: true }
                    },
                    {
                        reminderSent: true
                    },
                    {
                        returnDocument: "after"
                    }
                );

                if (!updated) continue;

                await SendWebhook(
                    "https://webhook.site/f20dafcc-7f50-4c37-84d9-90bacec546bb",
                    {
                        event: "todo.reminder",
                        data: {
                            id: todo._id,
                            title: todo.title
                        }
                    }
                );
            }
        } catch (err) {
            console.error("Reminder job failed:", err.message);
        }
    }, { timezone: "Asia/Karachi" });
    cron.schedule("0 0 10 * *", async () => {
        try {
            const limit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const result = await Todo.deleteMany({
                completed: true,
                updatedAt: { $lt: limit }
            });
            await clearCache("todos");
            console.log(`Cleanup done, deleted: ${result.deletedCount}`);
        } catch (err) {
            console.error("Cleanup job failed:", err.message);
        }
    }, { timezone: "Asia/Karachi" });
}