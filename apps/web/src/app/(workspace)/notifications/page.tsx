import React from "react";
import { api } from "@soustools/api-client";
import { Card, CardContent } from "@soustools/design-system";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let notifications = [];
  try {
    const { data, error } = await (api.GET as any)("/notifications", {
      cache: "no-store",
    });
    if (!error && data) {
      notifications = data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch all notifications:", error);
  }

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
          notifications.map((n: any) => (
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
    </div>
  );
}
