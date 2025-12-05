import { Pool } from "pg";

import config from "./index";
import { consoleLogger } from "@/utils";

const postgresSQLConn = new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    min: 10,
    max: 20,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
});

postgresSQLConn.on("connect", () => {
    consoleLogger(`Connected To PostgresSQL DB Pool\n`);
});

postgresSQLConn.on("acquire", () => {
    consoleLogger(`Connection Accquired From PostgresSQL DB Pool\n`);
});

postgresSQLConn.on("release", () => {
    consoleLogger(`Connection Released To PostgresSQL DB Pool\n`);
});

postgresSQLConn.on("error", (err) => {
    consoleLogger("PostgresSQL DB Connection Error: ", err);
});

postgresSQLConn.connect((err, connection) => {
    if (err) throw Error("Failed To Connect To PostgresSQL DB: " + err);
});

export default postgresSQLConn;
