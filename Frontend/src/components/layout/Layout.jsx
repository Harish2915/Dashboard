import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

const Layout = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (

        <div>

            <Sidebar sidebarOpen={sidebarOpen} />

            <div className="main">

                <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            </div>

        </div>

    )

}

export default Layout;