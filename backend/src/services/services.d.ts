import { type SetOptions } from "redis";
import { type S3 } from "aws-sdk";

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

export interface IStorageService extends S3 {
    getSignedURL: (
        filePath: string,
        expiry: number | null = null
    ) => Promise<string | null>;
}
