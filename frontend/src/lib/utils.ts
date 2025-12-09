import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getUserTokenFromLocalStorage = () => {
    try {
        let userData = localStorage.getItem("ablecredit-user") as any;

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

export const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1048576) {
        return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else if (sizeInBytes < 1073741824) {
        return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
    } else if (sizeInBytes < 1099511627776) {
        return `${(sizeInBytes / 1073741824).toFixed(2)} GB`;
    } else {
        return `${(sizeInBytes / 1099511627776).toFixed(2)} TB`;
    }
};

export const formatFileType = (mimeType: string) => {
    const typeParts = mimeType.split("/");

    return typeParts.length > 1
        ? typeParts[0].toUpperCase()
        : mimeType.toUpperCase();
};
