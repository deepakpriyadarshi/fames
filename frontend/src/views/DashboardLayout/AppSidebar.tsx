import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";

import NavMain from "./NavMain";
import NavUser from "./NavUser";

import ASSETS_IMAGES from "@/constants/assets";

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({
    ...props
}) => {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center justify-center py-5 bg-red-100 rounded-lg">
                    <img src={ASSETS_IMAGES.logo} alt="Logo" width={150} />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};

export default AppSidebar;
