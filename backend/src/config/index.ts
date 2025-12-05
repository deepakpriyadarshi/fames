import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend/.env
// From src/config, go up two levels to reach backend root
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

import { type IConfig } from "./config";

const config: IConfig = {
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",

    AWS_SPACE_ENDPOINT: process.env.AWS_SPACE_ENDPOINT || "",
    AWS_SPACE_ACCESS_KEY: process.env.AWS_SPACE_ACCESS_KEY || "",
    AWS_SPACE_ACCESS_SECRET: process.env.AWS_SPACE_ACCESS_SECRET || "",
    AWS_SPACE_BUCKET: process.env.AWS_SPACE_BUCKET || "",

    JSON_WEBTOKEN_SECRET: process.env.JSON_WEBTOKEN_SECRET || "",
    JSON_WEBTOKEN_EXPIRY: Number(process.env.JSON_WEBTOKEN_EXPIRY) || 3600,

    DB_HOST: process.env.DB_HOST || "",
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_USER: process.env.POSTGRES_USER || "",
    DB_PASSWORD: process.env.POSTGRES_PASSWORD || "",
    DB_DATABASE: process.env.POSTGRES_DB || "",
};

export default config;
