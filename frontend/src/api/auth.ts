import ABLECREDIT_API, { ABLECREDIT_PUBLIC_API } from "@/api/index";

import API_ROUTES from "@/constants/apiRoutes";

interface IRegisterParams {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
}

interface ILoginParams {
    email: string;
    password: string;
}

const register = async (params: IRegisterParams) => {
    return ABLECREDIT_PUBLIC_API.post(API_ROUTES.REGISTER, {
        ...params,
    });
};

const login = async (params: ILoginParams) => {
    return ABLECREDIT_PUBLIC_API.post(API_ROUTES.LOGIN, {
        ...params,
    });
};

const getSession = async () => {
    return ABLECREDIT_API.get(API_ROUTES.SESSION, {});
};

const ABLECREDIT_AUTH_API = {
    register,
    login,
    getSession,
};

export default ABLECREDIT_AUTH_API;
