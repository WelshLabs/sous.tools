import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { DisplaysService } from "./displays.service";
import { LayoutsService } from "./layouts.service";
import {
  SignageDisplayGQL,
  SignageDeckGQL,
  CreateSignageDeckInputGQL,
  UpdateSignageDeckInputGQL,
  CreateSignageDisplayInputGQL,
  UpdateSignageDisplayInputGQL,
} from "./signage.types";

@Resolver(() => SignageDisplayGQL)
export class SignageResolver {
  constructor(
    private readonly displaysService: DisplaysService,
    private readonly layoutsService: LayoutsService,
  ) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [SignageDisplayGQL], { name: "signageDisplays" })
  async getDisplays(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.displaysService.findAll(orgId) as Promise<any[]>;
  }

  @Query(() => [SignageDeckGQL], { name: "signageDecks" })
  async getDecks(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.layoutsService.findAll(orgId) as Promise<any[]>;
  }

  @Query(() => SignageDeckGQL, { name: "signageDeck", nullable: true })
  async getDeck(@Args("id") id: string): Promise<any> {
    return this.layoutsService.findOne(id);
  }

  @Query(() => SignageDeckGQL, { name: "signageDeckBySlug", nullable: true })
  async getDeckBySlug(
    @Args("slug") slug: string,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.layoutsService.findBySlug(orgId, slug);
  }

  @Mutation(() => SignageDeckGQL, { name: "createSignageDeck" })
  async createDeck(
    @Args("input") input: CreateSignageDeckInputGQL,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.layoutsService.create(orgId, input.name);
  }

  @Mutation(() => SignageDeckGQL, { name: "updateSignageDeck" })
  async updateDeck(
    @Args("id") id: string,
    @Args("input") input: UpdateSignageDeckInputGQL,
  ): Promise<any> {
    return this.layoutsService.update(id, input.name, input.slug, input.config);
  }

  @Mutation(() => SignageDeckGQL, { name: "deleteSignageDeck" })
  async deleteDeck(@Args("id") id: string): Promise<any> {
    return this.layoutsService.remove(id);
  }

  @Mutation(() => SignageDisplayGQL, { name: "createSignageDisplay" })
  async createDisplay(
    @Args("input") input: CreateSignageDisplayInputGQL,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.displaysService.create(orgId, input.name, input.deck_id);
  }

  @Mutation(() => SignageDisplayGQL, { name: "updateSignageDisplay" })
  async updateDisplay(
    @Args("id") id: string,
    @Args("input") input: UpdateSignageDisplayInputGQL,
  ): Promise<any> {
    return this.displaysService.update(id, input.name, input.deck_id);
  }

  @Mutation(() => SignageDisplayGQL, { name: "deleteSignageDisplay" })
  async deleteDisplay(@Args("id") id: string): Promise<any> {
    return this.displaysService.remove(id);
  }
}
