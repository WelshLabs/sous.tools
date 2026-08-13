import React from "react";
import { api } from "@soustools/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@soustools/design-system";

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
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">All Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Review your notifications history.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No notifications found.</p>
        ) : (
          notifications.map((n: any) => (
            <Card key={n.id} className={`w-full ${!n.readAt ? 'border-primary' : 'border-border'}`}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{n.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{n.message}</p>
                {!n.readAt && (
                  <div className="text-xs text-primary font-medium">Unread</div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
