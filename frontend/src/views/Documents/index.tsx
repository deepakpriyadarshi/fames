import DashboardLayout from "@/views/DashboardLayout";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState, useRef } from "react";
import { IDocument } from "./documents";
import EKLINE_DOCUMENT_API from "@/api/document";
import {
    FileUp,
    ScanSearch,
    SquareArrowOutUpRight,
    Trash2,
} from "lucide-react";
import { formatFileSize, formatFileType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NewDocument from "./NewDocument";
import PreviewDocument from "./PreviewDocument";
import { toast } from "sonner";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
        useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<{
        documentId: string;
        documentName: string;
    } | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [previewDocument, setPreviewDocument] = useState<IDocument | null>(
        null
    );

    const prevIsDialogOpen = useRef<boolean>(false);
    const prevIsDeleteDialogOpen = useRef<boolean>(false);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const { data: documentsResponse } =
                    await EKLINE_DOCUMENT_API.getDocuments();

                if (documentsResponse.status === "success") {
                    setDocuments(documentsResponse.data);
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        const newDocumentDialogClosed =
            prevIsDialogOpen.current && !isDialogOpen;
        const deleteDialogClosed =
            prevIsDeleteDialogOpen.current && !isDeleteDialogOpen;

        if (newDocumentDialogClosed || deleteDialogClosed) {
            const fetchDocuments = async () => {
                try {
                    const { data: documentsResponse } =
                        await EKLINE_DOCUMENT_API.getDocuments();

                    if (documentsResponse.status === "success") {
                        setDocuments(documentsResponse.data);
                    }
                } catch (error) {
                    console.error("Error fetching documents:", error);
                }
            };

            fetchDocuments();
        }

        prevIsDialogOpen.current = isDialogOpen;
        prevIsDeleteDialogOpen.current = isDeleteDialogOpen;
    }, [isDialogOpen, isDeleteDialogOpen]);

    const handleDeleteClick = (documentId: string, documentName: string) => {
        setDocumentToDelete({ documentId, documentName });
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            const { data: deleteResponse } =
                await EKLINE_DOCUMENT_API.deleteDocument({
                    documentId: documentToDelete.documentId,
                });

            if (deleteResponse.status === "success") {
                toast.success("Document deleted successfully", {
                    duration: 3000,
                    position: "bottom-center",
                });

                setIsDeleteDialogOpen(false);
                setDocumentToDelete(null);
            }
        } catch (error: any) {
            console.error("Error deleting document:", error);

            const message =
                error?.response?.data?.message || "Something went wrong";

            toast.error(message, {
                duration: 3000,
                position: "top-center",
            });
        }
    };

    const handlePreviewClick = (document: IDocument) => {
        setPreviewDocument(document);
        setIsPreviewOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Documents</h1>
                    <p className="text-gray-600 mb-6">
                        Manage and view your documents below.
                    </p>
                </div>
                <div>
                    <Button
                        variant="default"
                        className="mb-4"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <FileUp className="inline-block w-5" /> New Document
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader className="bg-gray-800">
                    <TableRow>
                        <TableHead className="w-[32%] text-white font-bold p-3">
                            Name
                        </TableHead>
                        <TableHead className="text-white font-bold">
                            Type
                        </TableHead>
                        <TableHead className="text-white font-bold">
                            Size
                        </TableHead>
                        <TableHead className="text-white font-bold text-right">
                            Action
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((document) => (
                        <TableRow key={document.documentId}>
                            <TableCell className="font-medium py-5">
                                {document.name}
                            </TableCell>
                            <TableCell>
                                {formatFileType(document.mimeType)}
                            </TableCell>
                            <TableCell>
                                {formatFileSize(document.fileSize)}
                            </TableCell>
                            <TableCell className="text-right">
                                <span
                                    title="Preview"
                                    onClick={() => handlePreviewClick(document)}
                                >
                                    <ScanSearch className="inline-block w-5 mr-2 cursor-pointer" />
                                </span>
                                <span
                                    title="Open Document"
                                    onClick={() => {
                                        window.open(
                                            document?.signedFilePath,
                                            "_target"
                                        );
                                    }}
                                >
                                    <SquareArrowOutUpRight className="inline-block w-5 ml-2 cursor-pointer" />
                                </span>
                                <span
                                    title="Delete Document"
                                    onClick={() =>
                                        handleDeleteClick(
                                            document.documentId,
                                            document.name
                                        )
                                    }
                                >
                                    <Trash2 className="inline-block w-5 ml-2 cursor-pointer text-red-500 hover:text-red-700" />
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <NewDocument
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
            />

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            <div className="text-center py-10 text-lg">
                                Are you sure you want to delete?
                                <br />
                                <span className="font-bold">
                                    {documentToDelete?.documentName}
                                </span>
                                <br />
                                This action cannot be undone.
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <PreviewDocument
                isPreviewOpen={isPreviewOpen}
                setIsPreviewOpen={setIsPreviewOpen}
                previewDocument={previewDocument}
            />
        </DashboardLayout>
    );
};

export default Documents;
