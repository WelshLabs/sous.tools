"use client";

import { NotificationsView, type NotificationItem } from "./Notifications.view";

export interface NotificationsProps {
  initialNotifications?: NotificationItem[];
  page?: number;
  totalPages?: number;
}

export function NotificationsContainer({
  initialNotifications = [],
  page = 1,
  totalPages = 1,
}: NotificationsProps) {
  return (
    <NotificationsView
      notifications={initialNotifications}
      page={page}
      totalPages={totalPages}
    />
  );
}

export { NotificationsContainer as Notifications };
