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
import { useEffect, useState } from "react";
import { IDocument } from "./documents";
import EKLINE_DOCUMENT_API from "@/api/document";
import { ScanSearch, SquareArrowOutUpRight } from "lucide-react";
import { formatFileSize, formatFileType } from "@/lib/utils";

const Documents: React.FC = () => {
    const invoices = [
        {
            document: "INV001",
            paymentStatus: "Paid",
            totalAmount: "$250.00",
            paymentMethod: "Credit Card",
        },
        {
            document: "INV002",
            paymentStatus: "Pending",
            totalAmount: "$150.00",
            paymentMethod: "PayPal",
        },
        {
            document: "INV003",
            paymentStatus: "Unpaid",
            totalAmount: "$350.00",
            paymentMethod: "Bank Transfer",
        },
        {
            document: "INV004",
            paymentStatus: "Paid",
            totalAmount: "$450.00",
            paymentMethod: "Credit Card",
        },
        {
            document: "INV005",
            paymentStatus: "Paid",
            totalAmount: "$550.00",
            paymentMethod: "PayPal",
        },
        {
            document: "INV006",
            paymentStatus: "Pending",
            totalAmount: "$200.00",
            paymentMethod: "Bank Transfer",
        },
        {
            document: "INV007",
            paymentStatus: "Unpaid",
            totalAmount: "$300.00",
            paymentMethod: "Credit Card",
        },
    ];

    const [documents, setDocuments] = useState<IDocument[]>([]);

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

    return (
        <DashboardLayout>
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
                                <span title="Preview">
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </DashboardLayout>
    );
};

export default Documents;
