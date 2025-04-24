import React, { useRef } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";

const NotificationDropdown = () => {
  const op = useRef(null);
  const notifications = [
    "New request received",
    "Database backup complete",
    "3 users joined",
    "Reminder: meeting at 3 PM",
  ];

  return (
    <>
      <Button
        icon="pi pi-bell"
        onClick={(e) => op.current.toggle(e)}
        className="p-button-text"
        aria-haspopup
        aria-controls="overlay_panel"
      />
      <OverlayPanel ref={op} id="overlay_panel">
        <div className="text-sm font-medium mb-2">Notifications</div>
        <ul className="space-y-2">
          {notifications.map((note, index) => (
            <li key={index} className="text-sm text-gray-700">
              {note}
            </li>
          ))}
        </ul>
      </OverlayPanel>
    </>
  );
};

export default NotificationDropdown;
