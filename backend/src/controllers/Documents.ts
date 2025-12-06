import { consoleLogger } from "@/utils";
import { IDocumentsController } from "./controllers";

import DocumentsModel from "@/models/Documents";
import config from "@/config";
import StorageService from "@/services/StorageService";
import { IRequest } from "@/middlewares/middlewares";
import { Response } from "express";

const DocumentsController: IDocumentsController = {
    createDocument: async (req: IRequest, res: Response) => {
        try {
            const { file, currentUser } = req;
            const { name } = req.body;

            if (!file) {
                return res.status(400).json({
                    status: "error",
                    message: "Required fields are missing",
                    requiredFields: ["file"],
                });
            }

            consoleLogger("File received in controller:", file);

            if (!["text/plain"].includes(file.mimetype)) {
                return res.status(400).json({
                    status: "error",
                    message: "File Type: " + file.mimetype + " Not Allowed For",
                    allowedFileTypes: ["text/plain"],
                });
            }

            const fileName =
                currentUser?.userId +
                "-" +
                Date.now() +
                "-" +
                file.originalname.replace(/ /g, "-");
            const filePath = `ekline/documents`;

            const uploadParams = {
                Body: file.buffer,
                Bucket: config.AWS_SPACE_BUCKET,
                Key: filePath + "/" + fileName,
                ContentType: file.mimetype,
                ContentDisposition: `inline; ${fileName}`,
            };

            const storedFile = await StorageService.upload(
                uploadParams
            ).promise();

            if (!storedFile) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to upload file",
                });
            }

            const Documents = new DocumentsModel();

            const newDocument = await Documents.createDocument({
                name: name || file.originalname,
                originalName: file.originalname,
                userId: currentUser.userId,
                filePath: filePath + "/" + fileName,
                fileSize: file.size,
                mimeType: file.mimetype,
            });

            if (!newDocument) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to create document",
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Document created successfully",
                data: {
                    ...newDocument,
                    signedFilePath: await StorageService.getSignedURL(
                        filePath + "/" + fileName
                    ),
                },
            });
        } catch (error) {
            consoleLogger("Error in createDocument controller", error);

            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },
    getDocuments: async (req: IRequest, res: Response) => {
        try {
            const { currentUser } = req;

            const Documents = new DocumentsModel();

            const documents = await Documents.findByUserId(currentUser.userId);

            const documentsWithSignedURLs = await Promise.all(
                documents.map(async (doc) => ({
                    ...doc,
                    signedFilePath: await StorageService.getSignedURL(
                        doc.filePath
                    ),
                }))
            );

            return res.status(200).json({
                status: "success",
                message: "Documents fetched successfully",
                data: documentsWithSignedURLs,
            });
        } catch (error) {
            consoleLogger("Error in getDocuments controller", error);

            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },
    getDocumentDetails: async (req: IRequest, res: Response) => {
        try {
            const { documentId } = req.params;
            const { currentUser } = req;

            const Documents = new DocumentsModel();

            const document = await Documents.findByDocumentId(documentId);

            if (!document) {
                return res.status(404).json({
                    status: "error",
                    message: "Document not found",
                });
            }

            if (document?.userId !== currentUser.userId) {
                return res.status(403).json({
                    status: "error",
                    message:
                        "You do not have permission to access this document",
                });
            }

            const documentWithSignedURL = {
                ...document,
                signedFilePath: await StorageService.getSignedURL(
                    document.filePath
                ),
            };

            return res.status(200).json({
                status: "success",
                message: "Document details fetched successfully",
                data: documentWithSignedURL,
            });
        } catch (error) {
            consoleLogger("Error in getDocumentDetails controller", error);

            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },
    updateDocument: async (req: IRequest, res: Response) => {
        try {
            const { documentId } = req.params;
            const { currentUser } = req;

            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "No data provided for update",
                });
            }

            const allowedUpdateFields = ["name"];

            const isValidUpdateData = Object.keys(updateData).every((key) =>
                allowedUpdateFields.includes(key)
            );

            if (!isValidUpdateData) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid fields in update data",
                    allowedFields: allowedUpdateFields,
                });
            }

            const Documents = new DocumentsModel();

            const document = await Documents.findByDocumentId(documentId);

            if (!document) {
                return res.status(404).json({
                    status: "error",
                    message: "Document not found",
                });
            }

            if (document?.userId !== currentUser.userId) {
                return res.status(403).json({
                    status: "error",
                    message:
                        "You do not have permission to update this document",
                });
            }

            const updatedDocument = await Documents.updateByDocumentId(
                documentId,
                updateData
            );

            if (!updatedDocument) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to update document",
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Document updated successfully",
            });
        } catch (error) {
            consoleLogger("Error in updateDocument controller", error);

            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },
    deleteDocument: async (req: IRequest, res: Response) => {
        try {
            const { documentId } = req.params;
            const { currentUser } = req;

            const Documents = new DocumentsModel();

            const document = await Documents.findByDocumentId(documentId);

            if (!document) {
                return res.status(404).json({
                    status: "error",
                    message: "Document not found",
                });
            }

            if (document?.userId !== currentUser.userId) {
                return res.status(403).json({
                    status: "error",
                    message:
                        "You do not have permission to delete this document",
                });
            }

            const documentDeleted = await Documents.deleteByDocumentId(
                documentId
            );

            if (!documentDeleted) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to delete document",
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Document deleted successfully",
            });
        } catch (error) {
            consoleLogger("Error in deleteDocument controller", error);

            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },
};

export default DocumentsController;
