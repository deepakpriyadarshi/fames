import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Maximize2, Minimize2 } from "lucide-react";
import { IDocument } from "./documents";

interface PreviewDocumentProps {
    isPreviewOpen: boolean;
    setIsPreviewOpen: (open: boolean) => void;
    previewDocument: IDocument | null;
}

const PreviewDocument: React.FC<PreviewDocumentProps> = ({
    isPreviewOpen,
    setIsPreviewOpen,
    previewDocument,
}: PreviewDocumentProps) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <SheetContent
                side="right"
                className="p-0 transition-all duration-300"
                style={{
                    width: isFullscreen ? "100%" : "50%",
                    maxWidth: isFullscreen ? "100%" : "50%",
                }}
            >
                <div className="flex flex-col h-full">
                    <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-lg font-semibold">
                                {previewDocument?.name || "Document Preview"}
                            </SheetTitle>
                            <div className="flex items-center gap-2 mr-5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleFullscreen}
                                    title={
                                        isFullscreen ? "Minimize" : "Fullscreen"
                                    }
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="h-4 w-4" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-hidden p-6">
                        {previewDocument?.signedFilePath && (
                            <iframe
                                src={previewDocument.signedFilePath}
                                className="w-full h-full border rounded"
                                title="Document Preview"
                            />
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default PreviewDocument;
