import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import config from "../src/config";

// Determine if we're running inside Docker. If running outside Docker and DB_HOST is a Docker service name, use localhost
const isDocker =
    fs.existsSync("/.dockerenv") || process.env.DOCKER_CONTAINER === "true";

let dbHost = config.DB_HOST;
if (!isDocker && (dbHost === "ekline-db" || dbHost.includes("ekline-db"))) {
    dbHost = "localhost";
    console.log(
        `Running outside Docker, using localhost instead of ${config.DB_HOST}`
    );
}

const databaseUrl = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${dbHost}:${config.DB_PORT}/${config.DB_DATABASE}`;

const args = process.argv.slice(2).join(" ");

process.env.DATABASE_URL = databaseUrl;

try {
    const updatedEnv = {
        ...process.env,
        DATABASE_URL: databaseUrl,
    };

    // Use tsx directly to run node-pg-migrate, which handles TypeScript files in ESM mode
    // node-pg-migrate v8 uses ESM, and tsx can process .ts migration files
    const nodePgMigratePath = path.resolve(
        __dirname,
        "../node_modules/.bin/node-pg-migrate"
    );
    execSync(`tsx ${nodePgMigratePath} ${args}`, {
        stdio: "inherit",
        env: updatedEnv,
        cwd: path.resolve(__dirname, ".."),
    });
} catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
}
