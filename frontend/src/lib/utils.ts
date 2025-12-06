import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getUserTokenFromLocalStorage = () => {
    try {
        let userData = localStorage.getItem("ekline-user") as any;

        if (userData) {
            userData = JSON.parse(userData);

            return userData?.state?.user?.token;
        }

        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getUserInitials = (name: string) => {
    const names = name.split(" ");

    const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");

    return initials;
};
