import { Resolver, Subscription, Query, Args } from "@nestjs/graphql";
import { Inject } from "@nestjs/common";
import { type RedisPubSub } from "graphql-redis-subscriptions";
import { CommandsService } from "./commands.service";
import { AgentTrajectoryStep, AGENT_TRAJECTORY_TOPIC } from "./commands.types";
import { PUB_SUB } from "../../core/graphql/pubsub";

@Resolver(() => AgentTrajectoryStep)
export class CommandsResolver {
  constructor(
    private readonly commandsService: CommandsService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @Query(() => [AgentTrajectoryStep], {
    name: "conversationMessages",
    description:
      "Get all messages and trajectory history for a specific conversation",
  })
  async getConversationMessages(
    @Args("conversationId", { type: () => String }) conversationId: string,
  ): Promise<AgentTrajectoryStep[]> {
    const messages =
      await this.commandsService.getConversationMessages(conversationId);
    return messages.map((m) => ({
      id: m.id,
      conversationId,
      role: m.role,
      content: m.content,
      timestamp:
        m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
      isLoading: m.isLoading,
      uiAction: m.uiAction
        ? typeof m.uiAction === "string"
          ? m.uiAction
          : JSON.stringify(m.uiAction)
        : undefined,
      recipeData: m.recipeData
        ? typeof m.recipeData === "string"
          ? m.recipeData
          : JSON.stringify(m.recipeData)
        : undefined,
      invoiceData: m.invoiceData
        ? typeof m.invoiceData === "string"
          ? m.invoiceData
          : JSON.stringify(m.invoiceData)
        : undefined,
    }));
  }

  @Subscription(() => AgentTrajectoryStep, {
    name: "agentTrajectory",
    description:
      "Stream agent trajectory steps, thought processes, and results in real-time via graphql-ws",
    filter: (payload, variables) => {
      if (variables?.conversationId && payload.conversationId) {
        return payload.conversationId === variables.conversationId;
      }
      if (variables?.orgId && payload.orgId) {
        return payload.orgId === variables.orgId;
      }
      return true;
    },
    resolve: (payload) => payload.agentTrajectory || payload,
  })
  agentTrajectory(
    @Args("conversationId", { type: () => String, nullable: true })
    _conversationId?: string,
    @Args("orgId", { type: () => String, nullable: true }) _orgId?: string,
  ) {
    return this.pubSub.asyncIterableIterator(AGENT_TRAJECTORY_TOPIC);
  }
}
