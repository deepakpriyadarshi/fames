import { Router } from "express";

const authRouter = Router();

import AuthController from "@/controllers/Auth";

// /v1/auth/register
authRouter.post("/register", AuthController.register);

// /v1/auth/login
authRouter.post("/login", AuthController.login);

export default authRouter;
