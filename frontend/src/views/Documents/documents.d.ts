export interface IDocument {
    documentId: string;
    name: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    signedFilePath: string;
    createdAt: string;
    updatedAt: string;
}
