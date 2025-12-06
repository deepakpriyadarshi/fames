const API_ROUTES = {
    BASE_URL: "http://localhost:4000/v1",

    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    SESSION: "/auth/session",

    /* Documents */
    CREATE_DOCUMENT: "/documents",
    GET_DOCUMENTS: "/documents",
    GET_DOCUMENT_DETAILS: (documentId: string) => `/documents/${documentId}`,
    UPDATE_DOCUMENT: (documentId: string) => `/documents/${documentId}`,
    DELETE_DOCUMENT: (documentId: string) => `/documents/${documentId}`,
};

export default API_ROUTES;
