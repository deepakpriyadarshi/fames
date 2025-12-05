import request from "supertest";
import { app } from "@/app";
import postgresSQLConn from "@/config/database";
import RedisService from "@/services/RedisService";
import { hashSync, genSaltSync, compareSync } from "bcrypt";
import { sign } from "jsonwebtoken";
import config from "@/config";

jest.mock("@/config/database", () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
    },
}));

jest.mock("@/services/RedisService", () => ({
    __esModule: true,
    default: {
        setKey: jest.fn(),
        getKey: jest.fn(),
        deleteKey: jest.fn(),
        deleteMatchingKeys: jest.fn(),
    },
}));

jest.mock("@/utils", () => ({
    consoleLogger: jest.fn(),
    toSnakeCase: jest.fn((obj) => {
        const result: Record<string, any> = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const snakeKey = key.replace(
                    /[A-Z]/g,
                    (letter) => `_${letter.toLowerCase()}`
                );
                result[snakeKey] = obj[key];
            }
        }
        return result;
    }),
    toCamelCase: jest.fn((obj) => {
        const result: Record<string, any> = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
                    letter.toUpperCase()
                );
                result[camelKey] = obj[key];
            }
        }
        return result;
    }),
}));

describe("Auth API Integration Tests", () => {
    const mockedQuery = postgresSQLConn.query as jest.MockedFunction<any>;
    const mockedRedisSetKey = RedisService.setKey as jest.MockedFunction<any>;
    const mockedRedisGetKey = RedisService.getKey as jest.MockedFunction<any>;
    const mockedRedisDeleteKey =
        RedisService.deleteKey as jest.MockedFunction<any>;

    const testUser = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        firstName: "Deepak",
        lastName: "Priyadarshi",
        email: "deepak@example.com",
        password: "testPassword123",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const testUserSnakeCase = {
        user_id: testUser.userId,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        email: testUser.email,
        password: hashSync(testUser.password, genSaltSync(10)),
        created_at: testUser.createdAt,
        updated_at: testUser.updatedAt,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /v1/auth/register", () => {
        it("should register a new user successfully", async () => {
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testUserSnakeCase],
                    rowCount: 1,
                    command: "INSERT",
                    oid: 0,
                    fields: [],
                });

            const response = await request(app)
                .post("/v1/auth/register")
                .send({
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe("User registered successfully");
            expect(response.body.data).toHaveProperty("userId");
            expect(response.body.data).toHaveProperty(
                "firstName",
                testUser.firstName
            );
            expect(response.body.data).toHaveProperty(
                "lastName",
                testUser.lastName
            );
            expect(response.body.data).toHaveProperty("email", testUser.email);
            expect(response.body.data).toHaveProperty("token");
            expect(response.body.data).not.toHaveProperty("password");
        });

        it("should return 400 if user already exists", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [testUserSnakeCase],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const response = await request(app)
                .post("/v1/auth/register")
                .send({
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe(
                "User already exists with email, try logging in"
            );
        });

        it("should return 400 if required fields are missing", async () => {
            const response = await request(app)
                .post("/v1/auth/register")
                .send({
                    firstName: testUser.firstName,
                    email: testUser.email,
                })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Required fields are missing");
        });

        it("should return 500 if user creation fails", async () => {
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "INSERT",
                    oid: 0,
                    fields: [],
                });

            const response = await request(app)
                .post("/v1/auth/register")
                .send({
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Failed to register user");
        });
    });

    describe("POST /v1/auth/login", () => {
        it("should login user successfully with valid credentials", async () => {
            const hashedPassword = hashSync(testUser.password, genSaltSync(10));
            const userWithHashedPassword = {
                ...testUserSnakeCase,
                password: hashedPassword,
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [userWithHashedPassword],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const response = await request(app)
                .post("/v1/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe("User logged in successfully");
            expect(response.body.data).toHaveProperty("userId");
            expect(response.body.data).toHaveProperty("email", testUser.email);
            expect(response.body.data).toHaveProperty("token");
            expect(response.body.data).not.toHaveProperty("password");
        });

        it("should return 400 if user does not exist", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const response = await request(app)
                .post("/v1/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: testUser.password,
                })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe(
                "User not found, please register first"
            );
        });

        it("should return 400 if password is incorrect", async () => {
            const hashedPassword = hashSync(testUser.password, genSaltSync(10));
            const userWithHashedPassword = {
                ...testUserSnakeCase,
                password: hashedPassword,
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [userWithHashedPassword],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const response = await request(app)
                .post("/v1/auth/login")
                .send({
                    email: testUser.email,
                    password: "wrongPassword123",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Invalid password");
        });

        it("should return 400 if email is missing", async () => {
            const response = await request(app)
                .post("/v1/auth/login")
                .send({
                    password: testUser.password,
                })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Required fields are missing");
        });
    });

    describe("GET /v1/auth/session", () => {
        it("should return user session with valid token", async () => {
            const userWithoutPassword = {
                userId: testUser.userId,
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email,
                createdAt: testUser.createdAt,
                updatedAt: testUser.updatedAt,
            };

            const token = sign(
                userWithoutPassword,
                config.JSON_WEBTOKEN_SECRET,
                {
                    expiresIn: config.JSON_WEBTOKEN_EXPIRY,
                }
            );

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery.mockResolvedValueOnce({
                rows: [testUserSnakeCase],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .get("/v1/auth/session")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe(
                "Session retrieved successfully"
            );
            expect(response.body.data).toHaveProperty(
                "userId",
                testUser.userId
            );
            expect(response.body.data).toHaveProperty("email", testUser.email);
            expect(response.body.data).not.toHaveProperty("password");
        });

        it("should return cached user session if available", async () => {
            const userWithoutPassword = {
                userId: testUser.userId,
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email,
                createdAt: testUser.createdAt,
                updatedAt: testUser.updatedAt,
                isCached: true,
            };

            const token = sign(
                userWithoutPassword,
                config.JSON_WEBTOKEN_SECRET,
                {
                    expiresIn: config.JSON_WEBTOKEN_EXPIRY,
                }
            );

            mockedRedisGetKey.mockResolvedValueOnce(userWithoutPassword);

            const response = await request(app)
                .get("/v1/auth/session")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data).toHaveProperty("isCached", true);
            expect(mockedQuery).not.toHaveBeenCalled();
        });

        it("should return 500 if authorization header is missing", async () => {
            const response = await request(app)
                .get("/v1/auth/session")
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Authorization header missing");
        });

        it("should return 500 if token is invalid", async () => {
            const response = await request(app)
                .get("/v1/auth/session")
                .set("Authorization", "Bearer invalid-token")
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Invalid Authorization Token");
        });

        it("should return 500 if user not found", async () => {
            const userWithoutPassword = {
                userId: "non-existent-id",
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email,
            };

            const token = sign(
                userWithoutPassword,
                config.JSON_WEBTOKEN_SECRET,
                {
                    expiresIn: config.JSON_WEBTOKEN_EXPIRY,
                }
            );

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const response = await request(app)
                .get("/v1/auth/session")
                .set("Authorization", `Bearer ${token}`)
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("User not found");
        });
    });
});
