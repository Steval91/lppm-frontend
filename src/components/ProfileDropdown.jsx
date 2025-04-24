import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";

const ProfileDropdown = () => {
  const menuRef = useRef(null);

  const items = [
    {
      label: "user",
      template: () => (
        <div className="p-3">
          <div className="font-semibold">Ketua Penelitian Fakultas</div>
          <div
            className="text-sm text-gray-500 truncate max-w-[150px] block email"
            data-pr-tooltip="lppm@example.com"
          >
            dosen@example.com
          </div>
        </div>
      ),
    },
    { separator: true },
    { label: "Profil", icon: "pi pi-user" },
    { label: "Notifikasi", icon: "pi pi-bell", badge: 3 },
    { separator: true },
    { label: "Keluar", icon: "pi pi-sign-out" },
  ];

  return (
    <div className="p-3">
      <Button
        onClick={(e) => menuRef.current.toggle(e)}
        className="flex items-center gap-2 w-full"
        text
      >
        {/* <Avatar image="https://i.pravatar.cc/40" shape="circle" /> */}
        <div className="flex-1 text-left">
          <Tooltip target=".email" />
          <div className="font-medium text-sm">Reviewer</div>
          <div
            className="text-xs text-gray-500 truncate max-w-[150px] block email"
            data-pr-tooltip="admin@example.com"
          >
            dosen@example.com
          </div>
        </div>
        <i className="pi pi-chevron-up text-xs"></i>
      </Button>
      <Menu model={items} popup ref={menuRef} className="w-full" />
    </div>
  );
};

export default ProfileDropdown;
