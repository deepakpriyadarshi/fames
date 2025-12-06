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

            const { Location, Key } = storedFile;

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
};

export default DocumentsController;
