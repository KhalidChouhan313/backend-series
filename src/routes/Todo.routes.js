import { Router } from "express";
import { CreateTodo, DeleteTodo, GetTodos, UpdateTodo } from "../controllers/Todo.controller.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";

const router = Router();

router.post("/", AuthMiddleware, authorize("user", "admin"), CreateTodo);
router.get("/", AuthMiddleware, cacheMiddleware("todos", 60), authorize("user", "admin"), GetTodos);
router.put("/:id", AuthMiddleware, authorize("user", "admin"), UpdateTodo);
router.delete("/:id", AuthMiddleware, authorize("user", "admin"), DeleteTodo);


export default router;