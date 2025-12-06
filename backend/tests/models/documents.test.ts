// Mock console.error before any imports to suppress expected error logs
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

import Documents from "@/models/Documents";
import postgresSQLConn from "@/config/database";
import { ICreateDocumentData, IDocument } from "@/models/Documents/documents.d";
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

describe("Documents Model", () => {
    let documentsModel: Documents;
    const mockedQuery = postgresSQLConn.query as jest.MockedFunction<any>;

    const testUserId = "123e4567-e89b-12d3-a456-426614174000";

    const testDocument: IDocument = {
        documentId: "doc-123e4567-e89b-12d3-a456-426614174000",
        name: "test-document.pdf",
        originalName: "Test Document.pdf",
        userId: testUserId,
        filePath: "/uploads/documents/test-document.pdf",
        fileSize: 1024000,
        mimeType: "application/pdf",
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

    const createDocumentData: ICreateDocumentData = {
        name: testDocument.name,
        originalName: testDocument.originalName,
        userId: testDocument.userId,
        filePath: testDocument.filePath,
        fileSize: testDocument.fileSize,
        mimeType: testDocument.mimeType,
    };

    beforeEach(() => {
        documentsModel = new Documents();
        jest.clearAllMocks();
    });

    describe("createDocument", () => {
        it("should create a document successfully", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [testDocumentSnakeCase],
                rowCount: 1,
                command: "INSERT",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.createDocument(
                createDocumentData
            );

            expect(result).not.toBeNull();
            expect(result?.documentId).toBe(testDocument.documentId);
            expect(result?.name).toBe(testDocument.name);
            expect(result?.originalName).toBe(testDocument.originalName);
            expect(result?.userId).toBe(testDocument.userId);
            expect(result?.filePath).toBe(testDocument.filePath);
            expect(result?.fileSize).toBe(testDocument.fileSize);
            expect(result?.mimeType).toBe(testDocument.mimeType);
            expect(mockedQuery).toHaveBeenCalledWith(
                "INSERT INTO documents (name, original_name, user_id, file_path, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [
                    testDocumentSnakeCase.name,
                    testDocumentSnakeCase.original_name,
                    testDocumentSnakeCase.user_id,
                    testDocumentSnakeCase.file_path,
                    testDocumentSnakeCase.file_size,
                    testDocumentSnakeCase.mime_type,
                ]
            );
        });

        it("should return null when no rows are returned", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "INSERT",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.createDocument(
                createDocumentData
            );

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const dbError = new Error("Database connection failed");
            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(
                documentsModel.createDocument(createDocumentData)
            ).rejects.toThrow(dbError);
        });
    });

    describe("findByDocumentId", () => {
        it("should find a document by documentId successfully", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [testDocumentSnakeCase],
                rowCount: 1,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.findByDocumentId(
                testDocument.documentId
            );

            expect(result).not.toBeNull();
            expect(result?.documentId).toBe(testDocument.documentId);
            expect(result?.name).toBe(testDocument.name);
            expect(mockedQuery).toHaveBeenCalledWith(
                "SELECT * FROM documents WHERE document_id = $1",
                [testDocument.documentId]
            );
        });

        it("should return null when document is not found", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.findByDocumentId(
                "non-existent-id"
            );

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const dbError = new Error("Database connection failed");
            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(
                documentsModel.findByDocumentId(testDocument.documentId)
            ).rejects.toThrow(dbError);
        });
    });

    describe("findByUserId", () => {
        it("should find documents by userId successfully", async () => {
            const secondDocument = {
                ...testDocumentSnakeCase,
                document_id: "doc-223e4567-e89b-12d3-a456-426614174000",
                name: "second-document.pdf",
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [testDocumentSnakeCase, secondDocument],
                rowCount: 2,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.findByUserId(testUserId);

            expect(result).toHaveLength(2);
            expect(result[0].documentId).toBe(testDocument.documentId);
            expect(result[1].documentId).toBe(secondDocument.document_id);
            expect(mockedQuery).toHaveBeenCalledWith(
                "SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC",
                [testUserId]
            );
        });

        it("should return empty array when no documents found", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "SELECT",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.findByUserId(testUserId);

            expect(result).toHaveLength(0);
            expect(Array.isArray(result)).toBe(true);
        });

        it("should throw error when database query fails", async () => {
            const dbError = new Error("Database connection failed");
            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(
                documentsModel.findByUserId(testUserId)
            ).rejects.toThrow(dbError);
        });
    });

    describe("updateByDocumentId", () => {
        it("should update a document successfully", async () => {
            const updatedData = {
                name: "updated-document.pdf",
                originalName: "Updated Document.pdf",
            };

            const updatedDocument = {
                ...testDocumentSnakeCase,
                name: updatedData.name,
                original_name: updatedData.originalName,
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [updatedDocument],
                rowCount: 1,
                command: "UPDATE",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.updateByDocumentId(
                testDocument.documentId,
                updatedData
            );

            expect(result).not.toBeNull();
            expect(result?.documentId).toBe(testDocument.documentId);
            expect(result?.name).toBe(updatedData.name);
            expect(result?.originalName).toBe(updatedData.originalName);
            expect(mockedQuery).toHaveBeenCalled();
        });

        it("should return null when no fields to update", async () => {
            (modelUtils.buildUpdateClauses as jest.Mock).mockReturnValueOnce(
                null
            );

            const result = await documentsModel.updateByDocumentId(
                testDocument.documentId,
                {}
            );

            expect(result).toBeNull();
            expect(mockedQuery).not.toHaveBeenCalled();
        });

        it("should return null when no rows are returned", async () => {
            const updatedData = {
                name: "updated-document.pdf",
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "UPDATE",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.updateByDocumentId(
                testDocument.documentId,
                updatedData
            );

            expect(result).toBeNull();
        });

        it("should throw error when database query fails", async () => {
            const updatedData = {
                name: "updated-document.pdf",
            };
            const dbError = new Error("Database connection failed");

            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(
                documentsModel.updateByDocumentId(
                    testDocument.documentId,
                    updatedData
                )
            ).rejects.toThrow(dbError);
        });

        it("should update only provided fields", async () => {
            const updatedData = {
                fileSize: 2048000,
            };

            const updatedDocument = {
                ...testDocumentSnakeCase,
                file_size: updatedData.fileSize,
            };

            mockedQuery.mockResolvedValueOnce({
                rows: [updatedDocument],
                rowCount: 1,
                command: "UPDATE",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.updateByDocumentId(
                testDocument.documentId,
                updatedData
            );

            expect(result).not.toBeNull();
            expect(result?.fileSize).toBe(updatedData.fileSize);
            expect(result?.name).toBe(testDocument.name);
        });
    });

    describe("deleteByDocumentId", () => {
        it("should delete a document successfully", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 1,
                command: "DELETE",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.deleteByDocumentId(
                testDocument.documentId
            );

            expect(result).toBe(true);
            expect(mockedQuery).toHaveBeenCalledWith(
                "DELETE FROM documents WHERE document_id = $1",
                [testDocument.documentId]
            );
        });

        it("should return false when document is not found", async () => {
            mockedQuery.mockResolvedValueOnce({
                rows: [],
                rowCount: 0,
                command: "DELETE",
                oid: 0,
                fields: [],
            });

            const result = await documentsModel.deleteByDocumentId(
                "non-existent-id"
            );

            expect(result).toBe(false);
        });

        it("should throw error when database query fails", async () => {
            const dbError = new Error("Database connection failed");
            mockedQuery.mockRejectedValueOnce(dbError);

            await expect(
                documentsModel.deleteByDocumentId(testDocument.documentId)
            ).rejects.toThrow(dbError);
        });
    });
});
