import { Request, Response } from "express";

export interface IAuthController {
    register: (req: Request, res: Response) => Promise<Response>;
    login: (req: Request, res: Response) => Promise<Response>;
    session: (req: Request, res: Response) => Promise<Response>;
}

export interface IDocumentsController {
    createDocument: (req: Request, res: Response) => Promise<Response>;
    getDocuments: (req: Request, res: Response) => Promise<Response>;
    getDocumentDetails: (req: Request, res: Response) => Promise<Response>;
    updateDocument: (req: Request, res: Response) => Promise<Response>;
    deleteDocument: (req: Request, res: Response) => Promise<Response>;
}
