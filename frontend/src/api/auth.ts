import EKLINE_API, { EKLINE_PUBLIC_API } from "@/api/index";

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
    return EKLINE_PUBLIC_API.post(API_ROUTES.REGISTER, {
        ...params,
    });
};

const login = async (params: ILoginParams) => {
    return EKLINE_PUBLIC_API.post(API_ROUTES.LOGIN, {
        ...params,
    });
};

const getSession = async () => {
    return EKLINE_API.get(API_ROUTES.SESSION, {});
};

const EKLINE_AUTH_API = {
    register,
    login,
    getSession,
};

export default EKLINE_AUTH_API;
