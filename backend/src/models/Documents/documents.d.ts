export interface ICreateDocumentData {
    name: string;
    originalName: string;
    userId: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
}

export interface IDocument {
    documentId: string;
    name: string;
    originalName: string;
    userId: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDocumentModel {
    createDocument: (
        document: ICreateDocumentData
    ) => Promise<IDocument | null>;
    findByDocumentId: (
        documentId: IDocument["documentId"]
    ) => Promise<IDocument | null>;
    findByUserId: (userId: IDocument["userId"]) => Promise<IDocument[]>;
    updateByDocumentId: (
        documentId: IDocument["documentId"],
        updatedDocumentData: Partial<
            Omit<IDocument, "documentId" | "userId" | "createdAt" | "updatedAt">
        >
    ) => Promise<IDocument | null>;
    deleteByDocumentId: (
        documentId: IDocument["documentId"]
    ) => Promise<boolean>;
}
