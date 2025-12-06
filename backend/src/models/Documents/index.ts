import { toCamelCase, toSnakeCase } from "@/utils";
import { ICreateDocumentData, IDocument, IDocumentModel } from "./documents.d";
import postgresSQLConn from "@/config/database";
import { buildUpdateClauses } from "@/utils/model";

class Documents implements IDocumentModel {
    async createDocument(documentData: ICreateDocumentData) {
        try {
            const snakeCaseData = toSnakeCase(documentData);

            const query =
                "INSERT INTO documents (name, original_name, user_id, file_path, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

            const { rows } = await postgresSQLConn.query(query, [
                snakeCaseData.name,
                snakeCaseData.original_name,
                snakeCaseData.user_id,
                snakeCaseData.file_path,
                snakeCaseData.file_size,
                snakeCaseData.mime_type,
            ]);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IDocument) : null;
        } catch (error) {
            console.error("Error creating document", error);

            throw error;
        }
    }

    async findByDocumentId(documentId: IDocument["documentId"]) {
        try {
            const query = "SELECT * FROM documents WHERE document_id = $1";

            const { rows } = await postgresSQLConn.query(query, [documentId]);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IDocument) : null;
        } catch (error) {
            console.error("Error finding document by document id", error);

            throw error;
        }
    }

    async findByUserId(userId: IDocument["userId"]) {
        try {
            const query = "SELECT * FROM documents WHERE user_id = $1";

            const { rows } = await postgresSQLConn.query(query, [userId]);

            return rows.map((row) => toCamelCase(row) as IDocument);
        } catch (error) {
            console.error("Error finding documents by user id", error);

            throw error;
        }
    }

    async updateByDocumentId(
        documentId: IDocument["documentId"],
        updatedDocumentData: Partial<
            Omit<IDocument, "documentId" | "userId" | "createdAt" | "updatedAt">
        >
    ) {
        try {
            const snakeCaseData = toSnakeCase(updatedDocumentData);

            const updateClauses = buildUpdateClauses(snakeCaseData);

            if (!updateClauses) {
                return null;
            }

            const { setClauses, values } = updateClauses;

            const query = `UPDATE documents SET ${setClauses} WHERE document_id = $${
                values.length + 1
            } RETURNING *`;

            const { rows } = await postgresSQLConn.query(query, [
                ...values,
                documentId,
            ]);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IDocument) : null;
        } catch (error) {
            console.error("Error updating document by document id", error);

            throw error;
        }
    }

    async deleteByDocumentId(documentId: IDocument["documentId"]) {
        try {
            const query = "DELETE FROM documents WHERE document_id = $1";

            const result = await postgresSQLConn.query(query, [documentId]);

            return result.rowCount ? true : false;
        } catch (error) {
            console.error("Error deleting document by document id", error);

            throw error;
        }
    }
}

export default Documents;
