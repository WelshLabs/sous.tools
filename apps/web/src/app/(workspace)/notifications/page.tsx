import React from "react";
import { api } from "@soustools/api-client";
import { Card, CardContent } from "@soustools/design-system";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = typeof params.page === "string" ? params.page : "1";
  const page = parseInt(pageParam, 10) || 1;
  const limit = 10;

  let notifications = [];
  let totalPages = 1;
  
  try {
    const { data, error } = await api.GET("/notifications", {
      params: {
        query: {
          page: page.toString(),
          limit: limit.toString(),
        },
      },
      cache: "no-store",
    });
    
    if (!error && data?.data) {
      // The API returns paginatedResult under data.data
      const paginatedData = data.data as any;
      notifications = paginatedData.data || [];
      totalPages = paginatedData.totalPages || 1;
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {page > 1 ? (
            <Link
              href={`/notifications?page=${page - 1}`}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80"
            >
              Previous
            </Link>
          ) : (
            <div className="px-4 py-2 bg-secondary/50 text-secondary-foreground/50 rounded-md text-sm font-medium cursor-not-allowed">
              Previous
            </div>
          )}
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/notifications?page=${page + 1}`}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80"
            >
              Next
            </Link>
          ) : (
            <div className="px-4 py-2 bg-secondary/50 text-secondary-foreground/50 rounded-md text-sm font-medium cursor-not-allowed">
              Next
            </div>
          )}
        </div>
      )}
    </div>
  );
}
