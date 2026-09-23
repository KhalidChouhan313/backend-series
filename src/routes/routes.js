import { Router } from "express";
import todosRoutes from "./Todo.routes.js";
import autRoutes from "./auth.routes.js";
const routes = Router();

routes.use('/todos', todosRoutes);
routes.use('/auth',autRoutes);

export default routes;