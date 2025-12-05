import { type LucideIcon } from "lucide-react";

export interface INavBarItem {
    title: string;
    url: string;
}

export interface INavBarData {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: INavBarItem[];
}
