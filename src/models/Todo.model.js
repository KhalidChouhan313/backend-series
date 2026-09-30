import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    dueDate:{
        type: Date,
    },
    reminderDate:{
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    });

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;