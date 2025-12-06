import EKLINE_DOCUMENT_API from "@/api/document";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface NewDocumentProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
}

const NewDocument: React.FC<NewDocumentProps> = ({
    isDialogOpen,
    setIsDialogOpen,
}: NewDocumentProps) => {
    const [newDocumentData, setNewDocumentData] = useState<{
        name: string;
        file: File | null;
    }>({
        name: "",
        file: null,
    });

    const handleDocumentUpload = async () => {
        try {
            const documentsResponse = await EKLINE_DOCUMENT_API.create({
                name: newDocumentData.name,
                file: newDocumentData.file as File,
            });

            if (documentsResponse?.data?.status === "success") {
                setIsDialogOpen(false);
                setNewDocumentData({ name: "", file: null });
            }

            console.log("Document uploaded successfully:", documentsResponse);
        } catch (error) {
            console.log("Error uploading document:", error);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Document</DialogTitle>

                    <DialogDescription>Upload a new document</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label>
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. New Document"
                            value={newDocumentData.name}
                            onChange={(e) =>
                                setNewDocumentData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label>
                            File <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="file"
                            placeholder=""
                            onChange={(e) =>
                                setNewDocumentData((prev) => ({
                                    ...prev,
                                    file: e.target.files
                                        ? e.target.files[0]
                                        : null,
                                }))
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button
                        disabled={
                            !newDocumentData.name || !newDocumentData.file
                        }
                        onClick={handleDocumentUpload}
                    >
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default NewDocument;
