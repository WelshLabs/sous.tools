import React from "react";
import { graphqlClient } from "@soustools/api-client";
import { NotificationsContainer } from "@soustools/domain-settings";

export const dynamic = "force-dynamic";

const GET_NOTIFICATIONS_PAGE_QUERY = `
  query GetNotificationsPage($page: Int!, $limit: Int!) {
    notifications(page: $page, limit: $limit) {
      data {
        id
        title
        message
        link
        createdAt
        readAt
      }
      totalPages
      total
    }
  }
`;

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
    const res = await graphqlClient.request<{
      notifications: {
        data: any[];
        totalPages: number;
        total: number;
      };
    }>(GET_NOTIFICATIONS_PAGE_QUERY, { page, limit });

    if (res.data?.notifications) {
      notifications = res.data.notifications.data || [];
      totalPages = res.data.notifications.totalPages || 1;
    }
  } catch (error) {
    console.error("Failed to fetch all notifications via GraphQL:", error);
  }

  return (
    <NotificationsContainer
      initialNotifications={notifications}
      page={page}
      totalPages={totalPages}
    />
  );
}
