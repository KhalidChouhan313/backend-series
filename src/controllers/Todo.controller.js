import AsyncHandler from "express-async-handler";
import Todo from "../models/Todo.model.js";

export const CreateTodo = AsyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const todo = await Todo.create({ title, description });
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
})

export const UpdateTodo = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const todo = await Todo.findByIdAndUpdate(id, { title, description }, { new: true })
    res.status(200).json({
        success: true,
        message: "Todo updated successfully",
        data: todo
    });
})

export const DeleteTodo = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
    });
})