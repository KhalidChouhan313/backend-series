import { Router } from "express";
import todosRoutes from "./Todo.routes.js";
import autRoutes from "./auth.routes.js";
import webhookRoutes from "./webhook.routes.js";
const routes = Router();

routes.use("/webhook", webhookRoutes);
routes.use('/todos', todosRoutes);
routes.use('/auth', autRoutes);

export default routes;