import React from "react";
import { NavLink } from "react-router-dom";
import { classNames } from "primereact/utils";
import ProfileDropdown2 from "./ProfileDropdown2";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { label: "Dashboard", path: "/", icon: "pi pi-th-large" },
  // { label: "Proposal Saya", path: "/my-proposals", icon: "pi pi-book" },
  // { label: "Pengajuan", path: "/proposals", icon: "pi pi-user-edit" },
  { label: "Proposal", path: "/proposals", icon: "pi pi-book" },
  { label: "Review", path: "/reviews", icon: "pi pi-check-square" },
  // {
  //   label: "Laporan Progres",
  //   path: "/progress-reports",
  //   icon: "pi pi-directions",
  // },
  // { label: "Laporan Akhir", path: "/final-reports", icon: "pi pi-flag" },
  // { label: "Penelitian", path: "/research", icon: "pi pi-list" },
];

const settingMenuItems = [
  { label: "Pengguna", path: "/users", icon: "pi pi-user" },
  { label: "Fakultas", path: "/faculties", icon: "pi pi-building" },
];

const SidebarMenu = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.name === "ADMIN");

  return (
    <div className="w-72 bg-white shadow-sm flex flex-col">
      <div className="p-4 text-2xl font-bold"></div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-md font-semibold text-gray-600 uppercase">
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-md transition-colors",
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

        {isAdmin && (
          <>
            <div className="px-4 mt-6 py-2 text-md font-semibold text-gray-600 uppercase">
              Pengaturan
            </div>
            <nav className="flex flex-col gap-1 px-2">
              {settingMenuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    classNames(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-md transition-colors",
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
          </>
        )}
      </div>

      {/* ProfileDropdown2 akan handle logout sendiri */}
      <ProfileDropdown2 />
    </div>
  );
};

export default React.memo(SidebarMenu);
