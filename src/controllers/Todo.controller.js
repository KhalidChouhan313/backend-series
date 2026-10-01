import AsyncHandler from "express-async-handler";
import Todo from "../models/Todo.model.js";
import redisClient from "../config/redis.js";
import { clearCache } from "../middlewares/cache.middleware.js";
import { SendWebhook } from "../utils/sendWebhook.js";

export const CreateTodo = AsyncHandler(async (req, res) => {
    const { title, description,dueDate } = req.body;
    const todo = await Todo.create({ title, description, dueDate });

    await clearCache("todos");
    SendWebhook("https://webhook.site/f20dafcc-7f50-4c37-84d9-90bacec546bb", {
        event: "todo.created",
        data: {
            id: todo._id,
            title: todo.title
        }
    });
    res.status(201).json({
        success: true,
        message: "Todo created successfully",
        data: todo
    });
})

export const GetTodos = AsyncHandler(async (req, res) => {
    const { search, completed, page = 1, limit = 10 } = req.query;


    const filter = {};
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }
    if (completed) {
        filter.completed = completed === "true";
    }
    const skip = (page - 1) * limit;
    const todos = await Todo.find(filter).skip(skip).limit(limit);
    const total = await Todo.countDocuments(filter)
    res.status(200).json({
        success: true,
        message: "Todos fetched successfully",
        data: todos,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
        }
    });
    res.status(200).json({ ...response, source: "database" });
})

export const UpdateTodo = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const todo = await Todo.findByIdAndUpdate(id, { title, description }, { new: true })
    await clearCache("todos");

    res.status(200).json({
        success: true,
        message: "Todo updated successfully",
        data: todo
    });
})

export const DeleteTodo = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    await clearCache("todos");

    res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
    });
})