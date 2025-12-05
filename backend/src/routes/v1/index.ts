import { Router } from "express";

const v1Router = Router();

import authRouter from "./auth";

v1Router.use("/auth", authRouter);

export default v1Router;
