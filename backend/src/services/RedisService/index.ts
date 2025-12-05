import { createClient, type SetOptions } from "redis";

import config from "@/config";
import { consoleLogger } from "@/utils";
import { IRedisService } from "../services";

const REDIS = createClient({
    url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
});

(async () => {
    REDIS.on("error", (err) => {
        consoleLogger("Redis Client Error", err);
    });

    REDIS.on("ready", () => consoleLogger("Redis is ready"));

    await REDIS.connect();

    await REDIS.ping();
})();

const RedisService = (): IRedisService => {
    const setKey = async (
        key: string,
        value: any,
        options: SetOptions = {}
    ) => {
        const data = await REDIS.set(
            key,
            typeof value === "object" ? JSON.stringify(value) : value,
            options
        );

        return data;
    };

    const getKey = async (key: string) => {
        const data = await REDIS.get(key);

        return data ? JSON.parse(data) : null;
    };

    const deleteKey = async (key: string) => {
        await REDIS.del(key);
    };

    const deleteMatchingKeys = async (key: string) => {
        const matchingKeys = await REDIS.keys("*" + key + "*");

        console.log("matchingKeys", { key, matchingKeys });

        for (let mki = 0; mki < matchingKeys.length; mki++) {
            await REDIS.del(matchingKeys[mki]);
        }
    };

    return {
        setKey,
        getKey,
        deleteKey,
        deleteMatchingKeys,
    };
};

export default RedisService();
