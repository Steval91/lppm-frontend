import React from "react";
import { NavLink } from "react-router-dom";
import { classNames } from "primereact/utils";
import ProfileDropdown from "./ProfileDropdown";

const menuItems = [
  { label: "Dashboard", path: "/", icon: "pi pi-th-large" },
  { label: "Proposal", path: "/proposals", icon: "pi pi-book" },
  // { label: "Payroll", path: "/payroll", icon: "pi pi-wallet" },
  // { label: "Rundown", path: "/rundown", icon: "pi pi-calendar" },
  // { label: "Attendance", path: "/attendance", icon: "pi pi-clock" },
  // { label: "Inbox", path: "/inbox", icon: "pi pi-inbox" },
];

const settingMenuItems = [
  { label: "Pengguna", path: "/users", icon: "pi pi-user" },
  { label: "Fakultas", path: "/faculties", icon: "pi pi-building" },
  // { label: "Dosen", path: "/lecturer", icon: "pi pi-users" },
  // { label: "Mahasiswa", path: "/student", icon: "pi pi-users" },
  // { label: "Settings", path: "/settings", icon: "pi pi-cog" },
];

const SidebarMenu = () => {
  return (
    <div className="w-64 bg-white shadow-sm flex flex-col">
      <div className="p-4 text-xl font-bold">LPPM Unklab</div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-sm font-semibold text-gray-600 uppercase">
          Penelitian
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              <i className={item.icon}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* <div className="px-4 mt-6 py-2 text-sm font-semibold text-gray-600 uppercase">
          Pengaturan
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {settingMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              <i className={item.icon}></i>
              {item.label}
            </NavLink>
          ))}
        </nav> */}
      </div>

      <ProfileDropdown />
    </div>
  );
};

export default SidebarMenu;
