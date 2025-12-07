import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import EKLINE_DOCUMENT_API from "@/api/document";

interface DeleteDocumentProps {
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    documentToDelete: {
        documentId: string;
        documentName: string;
    } | null;
}

const DeleteDocument: React.FC<DeleteDocumentProps> = ({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    documentToDelete,
}: DeleteDocumentProps) => {
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
            }
        } catch (error: any) {
            console.error("Error deleting document:", error);

            const message =
                error?.response?.data?.message || "Something went wrong";

            toast.error(message, {
                duration: 3000,
                position: "top-center",
            });
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
            </Dialog>;
        }
    };

    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                    <Button variant="destructive" onClick={handleConfirmDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteDocument;
