import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNavigate } from "react-router-dom";

import { getUserTokenFromLocalStorage } from "@/lib/utils";
import EKLINE_AUTH_API from "@/api/auth";
import APP_ROUTES from "@/constants/appRoutes";

import { IUser } from "./hooks";

interface IUserStore {
    user: IUser;
    setUser: (user: IUser) => void;
    clearUser: () => void;
}

const useUserStore = create<IUserStore>()(
    persist(
        (set) => ({
            user: { token: null } as IUser,
            setUser: (user) => set({ user }),
            clearUser: () => {
                set({ user: { token: null } as IUser });
            },
        }),
        {
            name: "ekline-user",
        }
    )
);

const useUser = () => {
    const { user, setUser, clearUser } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const token = getUserTokenFromLocalStorage();

        const fetchUserSession = async () => {
            if (!token) {
                return;
            }

            try {
                const { data: mySessionResponse } =
                    await EKLINE_AUTH_API.getSession();

                if (mySessionResponse.status === "success") {
                    const userData = {
                        ...user,
                        ...mySessionResponse.data,
                    };

                    setUser(userData);
                }
            } catch (error) {
                console.log("Error fetching user session:", error);

                clearUser();
                navigate(APP_ROUTES.LOGIN, { replace: true });
            }
        };

        fetchUserSession();
    }, []);

    return { user, setUser, clearUser };
};

export default useUser;
