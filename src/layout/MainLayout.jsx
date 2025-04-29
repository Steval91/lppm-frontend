import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import { useAuth } from "../contexts/AuthContext"; // Ganti ini

const MainLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Ambil logout dari context

  const handleLogout = () => {
    logout(); // Ini sekarang logout context (reset user + notifications + hapus token)
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
