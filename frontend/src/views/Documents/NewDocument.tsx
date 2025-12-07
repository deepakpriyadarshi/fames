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
import { toast } from "sonner";

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

                toast.success("Document uploaded successfully", {
                    duration: 3000,
                    position: "bottom-center",
                });
            }
        } catch (error: any) {
            console.log("Error uploading document:", error);

            const message =
                error?.response?.data?.message || "Something went wrong";

            toast.error(message, {
                duration: 3000,
                position: "top-center",
            });
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
                            accept=".txt"
                            placeholder=""
                            onChange={(e) => {
                                const selectedFile = e.target.files
                                    ? e.target.files[0]
                                    : null;

                                if (selectedFile) {
                                    const fileName = selectedFile.name;
                                    const fileExtension = fileName
                                        .split(".")
                                        .pop()
                                        ?.toLowerCase();

                                    if (fileExtension !== "txt") {
                                        toast.error(
                                            "Only .txt files are allowed",
                                            {
                                                duration: 3000,
                                                position: "top-center",
                                            }
                                        );

                                        e.target.value = "";
                                        return;
                                    }
                                }

                                setNewDocumentData((prev) => ({
                                    ...prev,
                                    file: selectedFile,
                                }));
                            }}
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
