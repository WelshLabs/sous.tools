import { Resolver, Query, Mutation, Args, Int, Context } from "@nestjs/graphql";
import { NotificationsService } from "./notifications.service";
import {
  NotificationItemGQL,
  PaginatedNotificationsPayload,
} from "./notifications.types";

@Resolver(() => NotificationItemGQL)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [NotificationItemGQL], { name: "unreadNotifications" })
  async getUnreadNotifications(
    @Context() ctx: any,
  ): Promise<NotificationItemGQL[]> {
    const req = ctx.req;
    const userId = req?.user?.id || req?.user?.sub;
    const orgId =
      req?.user?.user_metadata?.organization_id ||
      req?.user?.app_metadata?.organization_id ||
      req?.user?.organization_id;
    return this.notificationsService.getUnread(orgId, userId);
  }

  @Query(() => PaginatedNotificationsPayload, { name: "notifications" })
  async getNotifications(
    @Args("page", { type: () => Int, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Int, defaultValue: 10 }) limit: number,
    @Context() ctx: any,
  ): Promise<PaginatedNotificationsPayload> {
    const req = ctx.req;
    const userId = req?.user?.id || req?.user?.sub;
    const orgId =
      req?.user?.user_metadata?.organization_id ||
      req?.user?.app_metadata?.organization_id ||
      req?.user?.organization_id;
    return this.notificationsService.getAllPaginated(
      page,
      limit,
      orgId,
      userId,
    );
  }

  @Mutation(() => Boolean, { name: "markAllNotificationsRead" })
  async markAllNotificationsRead(@Context() ctx: any): Promise<boolean> {
    const req = ctx.req;
    const userId = req?.user?.id || req?.user?.sub;
    const orgId =
      req?.user?.user_metadata?.organization_id ||
      req?.user?.app_metadata?.organization_id ||
      req?.user?.organization_id;
    await this.notificationsService.markAllAsRead(orgId, userId);
    return true;
  }

  @Mutation(() => Boolean, { name: "markNotificationRead" })
  async markNotificationRead(@Args("id") id: string): Promise<boolean> {
    await this.notificationsService.markAsRead(id);
    return true;
  }
}
