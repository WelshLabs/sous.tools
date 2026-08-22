import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { UserProfileGQL, UpdateUserProfileInputGQL } from "./users.types";

@Resolver(() => UserProfileGQL)
export class UsersResolver {
  @Query(() => UserProfileGQL, { name: "currentUser" })
  async getCurrentUser(@Context() ctx: any): Promise<UserProfileGQL> {
    const user = ctx.req?.user;
    return {
      id: user?.id || user?.sub || "d0000000-0000-0000-0000-000000000000",
      email: user?.email || "admin@sous.tools",
      name:
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        "Chef Admin",
      role:
        user?.user_metadata?.role ||
        user?.app_metadata?.role ||
        "OWNER_OPERATOR",
    };
  }

  @Mutation(() => Boolean, { name: "updateUserProfile" })
  async updateUserProfile(
    @Args("id") _id: string,
    @Args("input") _input: UpdateUserProfileInputGQL,
  ): Promise<boolean> {
    return true;
  }
}
