"use client";

import Link from "next/link";
import { Card, CardContent } from "@soustools/design-system";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationsViewProps {
  notifications: NotificationItem[];
  page: number;
  totalPages: number;
}

export function NotificationsView({
  notifications,
  page,
  totalPages,
}: NotificationsViewProps) {
  return (
    <div className="animate-in fade-in mx-auto w-full max-w-5xl space-y-8 p-6 duration-500 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          All Notifications
        </h1>
        <p className="text-muted-foreground text-sm">
          Review your notifications history.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center">
            No notifications found.
          </p>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`w-full ${!n.readAt ? "border-primary" : "border-border"}`}
            >
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">{n.title}</h3>
                  <span className="text-muted-foreground text-xs">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-foreground text-sm">{n.message}</p>
                {!n.readAt && (
                  <div className="text-primary text-xs font-medium">Unread</div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-4">
          {page > 1 ? (
            <Link
              href={`/notifications?page=${page - 1}`}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium"
            >
              Previous
            </Link>
          ) : (
            <div className="bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed rounded-md px-4 py-2 text-sm font-medium">
              Previous
            </div>
          )}
          <span className="text-muted-foreground flex items-center text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/notifications?page=${page + 1}`}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium"
            >
              Next
            </Link>
          ) : (
            <div className="bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed rounded-md px-4 py-2 text-sm font-medium">
              Next
            </div>
          )}
        </div>
      )}
    </div>
  );
}
