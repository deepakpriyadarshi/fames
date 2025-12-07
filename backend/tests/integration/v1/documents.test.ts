import request from "supertest";
import { app } from "@/app";
import postgresSQLConn from "@/config/database";
import RedisService from "@/services/RedisService";
import StorageService from "@/services/StorageService";
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

jest.mock("@/services/StorageService", () => ({
    __esModule: true,
    default: {
        upload: jest.fn(() => ({
            promise: jest.fn(),
        })),
        getSignedURL: jest.fn(),
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

describe("Documents API Integration Tests", () => {
    const mockedQuery = postgresSQLConn.query as jest.MockedFunction<any>;
    const mockedRedisGetKey = RedisService.getKey as jest.MockedFunction<any>;
    const mockedRedisSetKey = RedisService.setKey as jest.MockedFunction<any>;
    const mockedStorageUpload = StorageService.upload as jest.MockedFunction<any>;
    const mockedGetSignedURL = StorageService.getSignedURL as jest.MockedFunction<any>;

    const testUserId = "123e4567-e89b-12d3-a456-426614174000";
    const testUser = {
        userId: testUserId,
        firstName: "Deepak",
        lastName: "Priyadarshi",
        email: "deepak@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const testDocument = {
        documentId: "doc-123e4567-e89b-12d3-a456-426614174000",
        name: "test-document.txt",
        originalName: "Test Document.txt",
        userId: testUserId,
        filePath: "ekline/documents/test-document.txt",
        fileSize: 1024,
        mimeType: "text/plain",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const testDocumentSnakeCase = {
        document_id: testDocument.documentId,
        name: testDocument.name,
        original_name: testDocument.originalName,
        user_id: testDocument.userId,
        file_path: testDocument.filePath,
        file_size: testDocument.fileSize,
        mime_type: testDocument.mimeType,
        created_at: testDocument.createdAt,
        updated_at: testDocument.updatedAt,
    };

    const getAuthToken = () => {
        return sign(testUser, config.JSON_WEBTOKEN_SECRET, {
            expiresIn: config.JSON_WEBTOKEN_EXPIRY,
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /v1/documents", () => {
        it("should create a document successfully", async () => {
            const token = getAuthToken();
            const fileBuffer = Buffer.from("Test file content");

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testDocumentSnakeCase],
                    rowCount: 1,
                    command: "INSERT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");
            mockedStorageUpload.mockReturnValue({
                promise: jest.fn().mockResolvedValue({
                    Location: "https://example.com/file.txt",
                }),
            });
            mockedGetSignedURL.mockResolvedValueOnce(
                "https://signed-url.example.com/file.txt"
            );

            const response = await request(app)
                .post("/v1/documents")
                .set("Authorization", `Bearer ${token}`)
                .attach("file", fileBuffer, "test-document.txt")
                .field("name", "test-document.txt")
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe("Document created successfully");
            expect(response.body.data).toHaveProperty("documentId");
            expect(response.body.data).toHaveProperty("name", "test-document.txt");
            expect(response.body.data).toHaveProperty("signedFilePath");
        });

        it("should return 400 if file is missing", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery.mockResolvedValueOnce({
                rows: [testUser],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .post("/v1/documents")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "test-document.txt")
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Required fields are missing");
        });

        it("should return 400 if file type is not allowed", async () => {
            const token = getAuthToken();
            const fileBuffer = Buffer.from("Test file content");

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery.mockResolvedValueOnce({
                rows: [testUser],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .post("/v1/documents")
                .set("Authorization", `Bearer ${token}`)
                .attach("file", fileBuffer, "test-document.pdf")
                .field("name", "test-document.pdf")
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toContain("Not Allowed For");
        });

        it("should return 500 if authorization header is missing", async () => {
            const fileBuffer = Buffer.from("Test file content");

            const response = await request(app)
                .post("/v1/documents")
                .attach("file", fileBuffer, "test-document.txt")
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Authorization header missing");
        });
    });

    describe("GET /v1/documents", () => {
        it("should get all documents for user successfully", async () => {
            const token = getAuthToken();
            const secondDocument = {
                ...testDocumentSnakeCase,
                document_id: "doc-223e4567-e89b-12d3-a456-426614174000",
                name: "second-document.txt",
            };

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testDocumentSnakeCase, secondDocument],
                    rowCount: 2,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");
            mockedGetSignedURL
                .mockResolvedValueOnce("https://signed-url-1.example.com")
                .mockResolvedValueOnce("https://signed-url-2.example.com");

            const response = await request(app)
                .get("/v1/documents")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe("Documents fetched successfully");
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty("signedFilePath");
        });

        it("should return empty array when user has no documents", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .get("/v1/documents")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data).toHaveLength(0);
        });

        it("should return 500 if authorization header is missing", async () => {
            const response = await request(app)
                .get("/v1/documents")
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Authorization header missing");
        });
    });

    describe("GET /v1/documents/:documentId", () => {
        it("should get document details successfully", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testDocumentSnakeCase],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");
            mockedGetSignedURL.mockResolvedValueOnce(
                "https://signed-url.example.com"
            );

            const response = await request(app)
                .get(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe(
                "Document details fetched successfully"
            );
            expect(response.body.data).toHaveProperty("documentId");
            expect(response.body.data).toHaveProperty("signedFilePath");
        });

        it("should return 404 if document not found", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .get("/v1/documents/non-existent-id")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Document not found");
        });

        it("should return 403 if user does not own the document", async () => {
            const token = getAuthToken();
            const otherUserDocument = {
                ...testDocumentSnakeCase,
                user_id: "other-user-id",
            };

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [otherUserDocument],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .get(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(403);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe(
                "You do not have permission to access this document"
            );
        });
    });

    describe("PATCH /v1/documents/:documentId", () => {
        it("should update document successfully", async () => {
            const token = getAuthToken();
            const updatedDocument = {
                ...testDocumentSnakeCase,
                name: "updated-document.txt",
            };

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testDocumentSnakeCase],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [updatedDocument],
                    rowCount: 1,
                    command: "UPDATE",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .patch(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "updated-document.txt" })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe("Document updated successfully");
        });

        it("should return 400 if no data provided for update", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .patch(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({})
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("No data provided for update");
        });

        it("should return 400 if invalid fields in update data", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .patch(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ invalidField: "value" })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Invalid fields in update data");
        });

        it("should return 404 if document not found", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .patch("/v1/documents/non-existent-id")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "updated-name.txt" })
                .expect(404);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Document not found");
        });

        it("should return 403 if user does not own the document", async () => {
            const token = getAuthToken();
            const otherUserDocument = {
                ...testDocumentSnakeCase,
                user_id: "other-user-id",
            };

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [otherUserDocument],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .patch(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "updated-name.txt" })
                .expect(403);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe(
                "You do not have permission to update this document"
            );
        });
    });

    describe("DELETE /v1/documents/:documentId", () => {
        it("should delete document successfully", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testDocumentSnakeCase],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 1,
                    command: "DELETE",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .delete(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toBe("Document deleted successfully");
        });

        it("should return 404 if document not found", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .delete("/v1/documents/non-existent-id")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Document not found");
        });

        it("should return 403 if user does not own the document", async () => {
            const token = getAuthToken();
            const otherUserDocument = {
                ...testDocumentSnakeCase,
                user_id: "other-user-id",
            };

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [otherUserDocument],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .delete(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(403);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe(
                "You do not have permission to delete this document"
            );
        });

        it("should return 500 if document deletion fails", async () => {
            const token = getAuthToken();

            mockedRedisGetKey.mockResolvedValueOnce(null);
            mockedQuery
                .mockResolvedValueOnce({
                    rows: [testUser],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [testDocumentSnakeCase],
                    rowCount: 1,
                    command: "SELECT",
                    oid: 0,
                    fields: [],
                })
                .mockResolvedValueOnce({
                    rows: [],
                    rowCount: 0,
                    command: "DELETE",
                    oid: 0,
                    fields: [],
                });
            mockedRedisSetKey.mockResolvedValueOnce("OK");

            const response = await request(app)
                .delete(`/v1/documents/${testDocument.documentId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(500);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toBe("Failed to delete document");
        });
    });
});

