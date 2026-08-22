import { Field, ObjectType, ID } from "@nestjs/graphql";

export const AGENT_TRAJECTORY_TOPIC = "AGENT_TRAJECTORY_UPDATED";

@ObjectType({
  description:
    "Represents an agent trajectory step, thought process, or omnibar message",
})
export class AgentTrajectoryStep {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  conversationId?: string;

  @Field()
  role!: string;

  @Field()
  content!: string;

  @Field(() => Date)
  timestamp!: Date;

  @Field(() => Boolean, { nullable: true })
  isLoading?: boolean;

  @Field({ nullable: true })
  uiAction?: string;

  @Field({ nullable: true })
  recipeData?: string;

  @Field({ nullable: true })
  invoiceData?: string;
}

@ObjectType({ description: "Represents a chat conversation" })
export class ChatConversationGQL {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  updated_at?: string;
}
