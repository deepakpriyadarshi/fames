import { Router } from "express";
import multer from "multer";

const authRouter = Router();

import DocumentsController from "@/controllers/Documents";
import verifyUserToken from "@/middlewares/auth";

// POST /v1/documents
authRouter.post(
    "/",
    verifyUserToken,
    multer().single("file"),
    DocumentsController.createDocument
);

// GET /v1/documents
authRouter.get("/", verifyUserToken, DocumentsController.getDocuments);

// GET /v1/documents/:documentId
authRouter.get(
    "/:documentId",
    verifyUserToken,
    DocumentsController.getDocumentDetails
);

// PATCH /v1/documents/:documentId
authRouter.post("/:documentId", verifyUserToken);

// DELETE /v1/documents/:documentId
authRouter.delete(
    "/:documentId",
    verifyUserToken,
    DocumentsController.deleteDocument
);

export default authRouter;
