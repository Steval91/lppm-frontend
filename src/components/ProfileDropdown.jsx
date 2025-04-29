import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { useAuth } from "../contexts/AuthContext"; // Tambah ini
import { useNavigate } from "react-router-dom";

const ProfileDropdown = () => {
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      label: user?.dosen.name,
      template: () => (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Avatar image="https://i.pravatar.cc/40" shape="circle" />
            <div className="flex flex-col">
              <div className="font-semibold">{user?.dosen.name || "-"}</div>
              <div
                className="text-sm text-gray-500 truncate max-w-[150px] block email"
                data-pr-tooltip={user?.email}
              >
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    { separator: true },
    { label: "Profil", icon: "pi pi-user" },
    { label: "Notifikasi", icon: "pi pi-bell" },
    { separator: true },
    {
      label: "Keluar",
      icon: "pi pi-sign-out",
      command: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <div className="p-3">
      <Button
        onClick={(e) => menuRef.current.toggle(e)}
        className="flex items-center gap-2 w-full"
        text
      >
        <Avatar image="https://i.pravatar.cc/40" shape="circle" />
        <div className="flex-1 text-left">
          <Tooltip target=".email" />
          <div className="font-medium text-md">
            {user?.dosen.name || "User"}
          </div>
          <div
            className="text-sm text-gray-500 truncate max-w-[150px] block email"
            data-pr-tooltip={user?.email}
          >
            {user?.email}
          </div>
        </div>
        <i className="pi pi-chevron-up text-xs"></i>
      </Button>
      <Menu model={items} popup ref={menuRef} className="w-full" />
    </div>
  );
};

export default ProfileDropdown;
