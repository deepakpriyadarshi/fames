import axios from "axios";

import API_ROUTES from "@/constants/apiRoutes";
import { getUserTokenFromLocalStorage } from "@/lib/utils";

const EKLINE_API = axios.create({
    baseURL: `${API_ROUTES.BASE_URL}`,
});

const EKLINE_PUBLIC_API = axios.create({
    baseURL: `${API_ROUTES.BASE_URL}`,
});

/* Add Authorization header to all requests */
EKLINE_API.interceptors.request.use((config) => {
    const token = getUserTokenFromLocalStorage();

    if (!token) {
        return Promise.reject(new Error("Access token not available"));
    }

    config.headers["Authorization"] = `Bearer ${token}`;

    return config;
});

export { EKLINE_API as default, EKLINE_PUBLIC_API };
