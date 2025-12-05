export interface IConfig {
    readonly REDIS_HOST: string;
    readonly REDIS_PORT: number;
    readonly REDIS_PASSWORD: string;

    readonly AWS_SPACE_ENDPOINT: string;
    readonly AWS_SPACE_ACCESS_KEY: string;
    readonly AWS_SPACE_ACCESS_SECRET: string;
    readonly AWS_SPACE_BUCKET: string;
}
