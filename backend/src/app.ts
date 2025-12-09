import express from "express";
import cors from "cors";

const app = express();

import v1Router from "@/routes/v1";

app.use(cors());
app.use(express.json());

app.use("/v1", v1Router);

app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "ablecredit-backend" });
});

export { app };
