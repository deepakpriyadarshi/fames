import { Router } from "express";

const v1Router = Router();

import authRouter from "./auth";
import documentsRouter from "./documents";

v1Router.use("/auth", authRouter);

v1Router.use("/documents", documentsRouter);

export default v1Router;
