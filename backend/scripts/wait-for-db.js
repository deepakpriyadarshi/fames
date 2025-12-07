const { execSync } = require("child_process");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const host = process.env.DB_HOST || "ekline-db";
const port = process.env.DB_PORT || "5432";
const user = process.env.POSTGRES_USER || process.env.DB_USER || "postgres";

console.log(`Waiting for database at ${host}:${port} to be ready...`);

(async () => {
    let retries = 30;
    let ready = false;

    while (retries > 0 && !ready) {
        try {
            execSync(`pg_isready -h ${host} -p ${port} -U ${user}`, {
                stdio: "ignore",
            });
            ready = true;
            console.log("Database is ready!");
        } catch (error) {
            retries--;
            if (retries > 0) {
                console.log(
                    `Database not ready yet, retrying... (${retries} attempts left)`
                );
                await sleep(2000);
            } else {
                console.error("Database failed to become ready in time");
                process.exit(1);
            }
        }
    }

    if (!ready) {
        console.error("Database connection timeout");
        process.exit(1);
    }
})();
