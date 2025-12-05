import { Router } from "express";

const authRouter = Router();

import AuthController from "@/controllers/Auth";
import verifyUserToken from "@/middlewares/auth";

// POST /v1/auth/register
authRouter.post("/register", AuthController.register);

// POST /v1/auth/login
authRouter.post("/login", AuthController.login);

// GET /v1/auth/session
authRouter.get("/session", verifyUserToken, AuthController.session);

export default authRouter;
