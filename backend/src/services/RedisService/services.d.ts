import { type SetOptions } from "redis";

export interface IRedisService {
    setKey: (
        key: string,
        value: any,
        options?: SetOptions
    ) => Promise<string | null>;
    getKey: (key: string) => Promise<any>;
    deleteKey: (key: string) => Promise<void>;
    deleteMatchingKeys: (key: string) => Promise<void>;
}
