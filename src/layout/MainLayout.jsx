import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import { logout } from "../utils/auth";

const MainLayout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      <SidebarMenu onLogout={handleLogout} />
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
