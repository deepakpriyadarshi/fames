import ABLECREDIT_API, { ABLECREDIT_PUBLIC_API } from "@/api/index";

import API_ROUTES from "@/constants/apiRoutes";

interface ICreateDocumentParams {
    name: string;
    file: File;
}

interface IGetDocumentDetailsParams {
    documentId: string;
}

interface IUpdateDocumentParams {
    documentId: string;
    data: Partial<any>;
}

interface IDeleteDocumentParams {
    documentId: string;
}

const create = async (params: ICreateDocumentParams) => {
    const { file, name } = params;

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("name", name);

    return ABLECREDIT_API.post(API_ROUTES.CREATE_DOCUMENT, formData);
};

const getDocuments = async () => {
    return ABLECREDIT_API.get(API_ROUTES.GET_DOCUMENTS, {});
};

const getDocumentDetails = async (params: IGetDocumentDetailsParams) => {
    const { documentId } = params;

    return ABLECREDIT_API.get(
        `${API_ROUTES.GET_DOCUMENT_DETAILS(documentId)}`,
        {}
    );
};

const updateDocument = async (params: IUpdateDocumentParams) => {
    const { documentId, data } = params;

    return ABLECREDIT_API.put(
        `${API_ROUTES.UPDATE_DOCUMENT(documentId)}`,
        data
    );
};

const deleteDocument = async (params: IDeleteDocumentParams) => {
    const { documentId } = params;

    return ABLECREDIT_API.delete(`${API_ROUTES.DELETE_DOCUMENT(documentId)}`);
};

const ABLECREDIT_DOCUMENT_API = {
    create,
    getDocuments,
    getDocumentDetails,
    updateDocument,
    deleteDocument,
};

export default ABLECREDIT_DOCUMENT_API;
