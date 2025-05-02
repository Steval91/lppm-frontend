import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { OverlayPanel } from "primereact/overlaypanel";
import { Badge } from "primereact/badge";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileDropdown2 = () => {
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const {
    user,
    logout,
    notifications,
    notificationSummary,
    markNotificationAsRead,
  } = useAuth();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) await markNotificationAsRead(notif.id);
    notifRef.current.hide(); // tutup overlay panel
    if (notif.relatedId) {
      navigate(`/proposals/${notif.relatedId}`);
    }
  };

  let username = "";
  if (user?.userType === "DOSEN_STAFF") {
    const roleNames = user.roles?.map((role) => role.name);
    username = roleNames?.includes("ADMIN") ? user.username : user.dosen?.name;
  } else if (user?.userType === "STUDENT") {
    username = user.student?.name;
  }

  const items = [
    {
      label: username,
      template: () => (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="font-semibold">{username}</div>
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
    <div className="flex items-center gap-3 px-3 py-2">
      <Tooltip target=".email" />

      {/* Notifikasi button */}
      <div className="relative">
        <Button
          icon="pi pi-bell"
          rounded
          outlined
          className="relative"
          onClick={(e) => notifRef.current.toggle(e)}
        />
        {notificationSummary?.totalUnread > 0 && (
          <Badge
            value={notificationSummary.totalUnread}
            severity="danger"
            className="absolute -top-1 -right-1"
          />
        )}
      </div>

      {/* Notifikasi Panel */}
      <OverlayPanel
        ref={notifRef}
        className="w-80 max-h-96 overflow-y-auto"
        dismissable
      >
        <div className="p-2">
          <h4 className="mb-2 font-semibold">Notifikasi Belum Dibaca</h4>
          {unreadNotifications.length === 0 ? (
            <div className="text-gray-500 text-sm">
              Tidak ada notifikasi baru.
            </div>
          ) : (
            unreadNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="text-sm">{notif.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(notif.createdAt).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </div>
      </OverlayPanel>

      {/* User menu */}
      <Button
        onClick={(e) => menuRef.current.toggle(e)}
        className="flex items-center justify-between gap-2 w-full"
        text
      >
        {/* <Avatar icon="pi pi-user" shape="circle" size="small" /> */}
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-md">{username}</span>
          <span
            className="text-sm text-gray-500 truncate max-w-[150px] email"
            data-pr-tooltip={user?.email}
          >
            {user?.email}
          </span>
        </div>
        <i className="pi pi-chevron-down text-xs" />
      </Button>

      <Menu model={items} popup ref={menuRef} />
    </div>
  );
};

export default ProfileDropdown2;
