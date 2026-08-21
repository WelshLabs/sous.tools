import React from "react";
import { api } from "@soustools/api-client";
import { NotificationsContainer } from "@soustools/domain-settings";

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
      const paginatedData = data.data as any;
      notifications = paginatedData.data || [];
      totalPages = paginatedData.totalPages || 1;
    }
  } catch (error) {
    console.error("Failed to fetch all notifications:", error);
  }

  return (
    <NotificationsContainer
      initialNotifications={notifications}
      page={page}
      totalPages={totalPages}
    />
  );
}
