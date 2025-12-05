export interface IConfig {
    readonly REDIS_HOST: string;
    readonly REDIS_PORT: number;
    readonly REDIS_PASSWORD: string;

    readonly AWS_SPACE_ENDPOINT: string;
    readonly AWS_SPACE_ACCESS_KEY: string;
    readonly AWS_SPACE_ACCESS_SECRET: string;
    readonly AWS_SPACE_BUCKET: string;

    readonly JSON_WEBTOKEN_SECRET: string;
    readonly JSON_WEBTOKEN_EXPIRY: number;

    readonly DB_HOST: string;
    readonly DB_PORT: number;
    readonly DB_USER: string;
    readonly DB_PASSWORD: string;
    readonly DB_DATABASE: string;
}
