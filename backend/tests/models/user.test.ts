import User from "@/models/User";
import postgresSQLConn from "@/config/database";
import { ICreateUserData, IUpdateUserData } from "@/models/User/user";
import * as modelUtils from "@/utils/model";

jest.mock("@/config/database", () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
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

jest.mock("@/utils/model", () => ({
    buildUpdateClauses: jest.fn(
        (data: Record<string, any>, startParamIndex: number = 1) => {
            const setClauses: string[] = [];
            const values: any[] = [];
            let paramIndex = startParamIndex;

            for (const key in data) {
                if (data.hasOwnProperty(key) && data[key] !== undefined) {
                    setClauses.push(`${key} = $${paramIndex}`);
                    values.push(data[key]);
                    paramIndex++;
                }
            }

            if (setClauses.length === 0) {
                return null;
            }

            return { setClauses, values };
        }
    ),
}));

describe("User Model", () => {
    let userModel: User;
    const mockedQuery = postgresSQLConn.query as jest.MockedFunction<any>;

    beforeEach(() => {
        userModel = new User();
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        it("should create a user successfully", async () => {
            const newUserData: ICreateUserData = {
                firstName: "Deepak",
                lastName: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
            };

            const mockUser = {
                user_id: "123e4567-e89b-12d3-a456-426614174000",
                first_name: "Deepak",
                last_name: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [mockUser],
                rowCount: 1,
                command: "INSERT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.createUser(newUserData);

            expect(result).not.toBeNull();
            expect(result?.userId).toBe(mockUser.user_id);
            expect(result?.firstName).toBe(mockUser.first_name);
            expect(result?.lastName).toBe(mockUser.last_name);
            expect(result?.email).toBe(mockUser.email);
            expect(mockedQuery).toHaveBeenCalledWith(
                "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
                [
                    mockUser.first_name,
                    mockUser.last_name,
                    mockUser.email,
                    mockUser.password,
                ]
            );
        });

        it("should return null when no rows are returned", async () => {
            const newUserData: ICreateUserData = {
                firstName: "Deepak",
                lastName: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "INSERT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.createUser(newUserData);

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const newUserData: ICreateUserData = {
                firstName: "Deepak",
                lastName: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
            };

            const dbError = new Error("Database connection failed");
            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(userModel.createUser(newUserData)).rejects.toThrow(
                dbError
            );
        });

        it("should handle user without lastName", async () => {
            const newUserData: ICreateUserData = {
                firstName: "Deepak",
                email: "deepak@example.com",
                password: "hashedPassword123",
            };

            const mockUser = {
                user_id: "123e4567-e89b-12d3-a456-426614174000",
                first_name: "Deepak",
                last_name: null,
                email: "deepak@example.com",
                password: "hashedPassword123",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [mockUser],
                rowCount: 1,
                command: "INSERT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.createUser(newUserData);

            expect(result).not.toBeNull();
            expect(result?.firstName).toBe(mockUser.first_name);
        });
    });

    describe("findByUserId", () => {
        it("should find a user by userId successfully", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const mockUser = {
                user_id: userId,
                first_name: "Deepak",
                last_name: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [mockUser],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.findByUserId(userId);

            expect(result).not.toBeNull();
            expect(result?.userId).toBe(userId);
            expect(result?.email).toBe(mockUser.email);
            expect(mockedQuery).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE user_id = $1",
                [userId]
            );
        });

        it("should return null when user is not found", async () => {
            const userId = "non-existent-id";

            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.findByUserId(userId);

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const dbError = new Error("Database connection failed");

            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(userModel.findByUserId(userId)).rejects.toThrow(
                dbError
            );
        });
    });

    describe("findByEmail", () => {
        it("should find a user by email successfully", async () => {
            const email = "deepak@example.com";
            const mockUser = {
                user_id: "123e4567-e89b-12d3-a456-426614174000",
                first_name: "Deepak",
                last_name: "Priyadarshi",
                email: email,
                password: "hashedPassword123",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [mockUser],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.findByEmail(email);

            expect(result).not.toBeNull();
            expect(result?.email).toBe(email);
            expect(mockedQuery).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );
        });

        it("should return null when user is not found", async () => {
            const email = "notfound@example.com";

            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await userModel.findByEmail(email);

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const email = "deepak@example.com";
            const dbError = new Error("Database connection failed");

            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(userModel.findByEmail(email)).rejects.toThrow(dbError);
        });
    });

    describe("updateByUserId", () => {
        it("should update a user successfully", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const updatedUserData: IUpdateUserData = {
                firstName: "Deepak",
                lastName: "Priyadarshi",
            };

            const mockUpdatedUser = {
                user_id: userId,
                first_name: "Deepak",
                last_name: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [mockUpdatedUser],
                rowCount: 1,
                command: "UPDATE",
                oid: 0,
                fields: [],
            });

            const result = await userModel.updateByUserId(
                userId,
                updatedUserData
            );

            expect(result).not.toBeNull();
            expect(result?.userId).toBe(userId);
            expect(result?.firstName).toBe("Deepak");
            expect(result?.lastName).toBe("Priyadarshi");
            expect(mockedQuery).toHaveBeenCalled();
        });

        it("should return null when no fields to update", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const updatedUserData: IUpdateUserData = {};

            (modelUtils.buildUpdateClauses as jest.Mock).mockReturnValueOnce(
                null
            );

            const result = await userModel.updateByUserId(
                userId,
                updatedUserData
            );

            expect(result).toBeNull();
            expect(mockedQuery).not.toHaveBeenCalled();
        });

        it("should return null when no rows are returned", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const updatedUserData: IUpdateUserData = {
                firstName: "Deepak",
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "UPDATE",
                oid: 0,
                fields: [],
            });

            const result = await userModel.updateByUserId(
                userId,
                updatedUserData
            );

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const updatedUserData: IUpdateUserData = {
                firstName: "Deepak",
            };
            const dbError = new Error("Database connection failed");

            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(
                userModel.updateByUserId(userId, updatedUserData)
            ).rejects.toThrow(dbError);
        });

        it("should update only provided fields", async () => {
            const userId = "123e4567-e89b-12d3-a456-426614174000";
            const updatedUserData: IUpdateUserData = {
                email: "deepak@example.com",
            };

            const mockUpdatedUser = {
                user_id: userId,
                first_name: "Deepak",
                last_name: "Priyadarshi",
                email: "deepak@example.com",
                password: "hashedPassword123",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [mockUpdatedUser],
                rowCount: 1,
                command: "UPDATE",
                oid: 0,
                fields: [],
            });

            const result = await userModel.updateByUserId(
                userId,
                updatedUserData
            );

            expect(result).not.toBeNull();
            expect(result?.email).toBe("deepak@example.com");
        });
    });
});
