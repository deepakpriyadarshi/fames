import EKLINE_API, { EKLINE_PUBLIC_API } from "@/api/index";

import API_ROUTES from "@/constants/apiRoutes";

interface ICreateDocumentParams {
    file: string;
    lastName?: string;
    email: string;
    password: string;
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
    const { file, ...otherParams } = params;

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    return EKLINE_API.post(API_ROUTES.CREATE_DOCUMENT, formData);
};

const getDocuments = async () => {
    return EKLINE_API.get(API_ROUTES.GET_DOCUMENTS, {});
};

const getDocumentDetails = async (params: IGetDocumentDetailsParams) => {
    const { documentId } = params;

    return EKLINE_API.get(`${API_ROUTES.GET_DOCUMENT_DETAILS(documentId)}`, {});
};

const updateDocument = async (params: IUpdateDocumentParams) => {
    const { documentId, data } = params;

    return EKLINE_API.put(`${API_ROUTES.UPDATE_DOCUMENT(documentId)}`, data);
};

const deleteDocument = async (params: IDeleteDocumentParams) => {
    const { documentId } = params;

    return EKLINE_API.delete(`${API_ROUTES.DELETE_DOCUMENT(documentId)}`);
};

const EKLINE_DOCUMENT_API = {
    create,
    getDocuments,
    getDocumentDetails,
    updateDocument,
    deleteDocument,
};

export default EKLINE_DOCUMENT_API;
