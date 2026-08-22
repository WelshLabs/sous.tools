import { Injectable, Logger } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  createdAt: string;
  readAt?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async getUnread(
    orgId?: string,
    userId?: string,
  ): Promise<NotificationItem[]> {
    let query = supabase
      .from("notifications")
      .select("id, title, message, link, is_read, created_at, updated_at")
      .eq("is_read", false);

    if (userId) {
      if (orgId && orgId !== "d0000000-0000-0000-0000-000000000000") {
        query = query.or(
          `user_id.eq.${userId},organization_id.eq.${orgId},user_id.eq.d0000000-0000-0000-0000-000000000000,user_id.is.null`,
        );
      } else {
        query = query.or(
          `user_id.eq.${userId},user_id.eq.d0000000-0000-0000-0000-000000000000,user_id.is.null`,
        );
      }
    } else if (orgId && orgId !== "d0000000-0000-0000-0000-000000000000") {
      query = query.or(
        `organization_id.eq.${orgId},organization_id.eq.d0000000-0000-0000-0000-000000000000`,
      );
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      this.logger.warn("Failed to fetch unread notifications:", error);
      const { data: allData } = await supabase
        .from("notifications")
        .select("id, title, message, link, is_read, created_at, updated_at")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(20);
      return (allData || []).map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        link: row.link,
        createdAt: row.created_at,
        readAt: row.is_read ? row.updated_at : null,
      }));
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      link: row.link,
      createdAt: row.created_at,
      readAt: row.is_read ? row.updated_at : null,
    }));
  }

  async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    orgId?: string,
    userId?: string,
  ): Promise<{ data: NotificationItem[]; totalPages: number; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("notifications")
      .select("id, title, message, link, is_read, created_at, updated_at", {
        count: "exact",
      });

    if (userId) {
      if (orgId && orgId !== "d0000000-0000-0000-0000-000000000000") {
        query = query.or(
          `user_id.eq.${userId},organization_id.eq.${orgId},user_id.eq.d0000000-0000-0000-0000-000000000000,user_id.is.null`,
        );
      } else {
        query = query.or(
          `user_id.eq.${userId},user_id.eq.d0000000-0000-0000-0000-000000000000,user_id.is.null`,
        );
      }
    } else if (orgId && orgId !== "d0000000-0000-0000-0000-000000000000") {
      query = query.or(
        `organization_id.eq.${orgId},organization_id.eq.d0000000-0000-0000-0000-000000000000`,
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      this.logger.warn("Failed to fetch paginated notifications:", error);
      const { data: allData, count: allCount } = await supabase
        .from("notifications")
        .select("id, title, message, link, is_read, created_at, updated_at", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .range(from, to);
      const total = allCount || 0;
      return {
        data: (allData || []).map((row) => ({
          id: row.id,
          title: row.title,
          message: row.message,
          link: row.link,
          createdAt: row.created_at,
          readAt: row.is_read ? row.updated_at : null,
        })),
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total,
      };
    }

    const total = count || 0;
    return {
      data: (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        link: row.link,
        createdAt: row.created_at,
        readAt: row.is_read ? row.updated_at : null,
      })),
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
    };
  }

  async markAllAsRead(
    orgId?: string,
    userId?: string,
  ): Promise<{ success: boolean }> {
    let query = supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("is_read", false);

    if (userId) {
      if (orgId && orgId !== "d0000000-0000-0000-0000-000000000000") {
        query = query.or(
          `user_id.eq.${userId},organization_id.eq.${orgId},user_id.eq.d0000000-0000-0000-0000-000000000000,user_id.is.null`,
        );
      } else {
        query = query.or(
          `user_id.eq.${userId},user_id.eq.d0000000-0000-0000-0000-000000000000,user_id.is.null`,
        );
      }
    } else if (orgId && orgId !== "d0000000-0000-0000-0000-000000000000") {
      query = query.eq("organization_id", orgId);
    }

    await query;
    return { success: true };
  }

  async markAsRead(id: string): Promise<{ success: boolean }> {
    await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    return { success: true };
  }
}
