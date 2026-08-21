import { Module, Global } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { pubSubProvider, PUB_SUB } from "./pubsub";

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        "graphql-ws": true,
      },
    }),
  ],
  providers: [pubSubProvider],
  exports: [GraphQLModule, pubSubProvider, PUB_SUB],
})
export class AppGraphQLModule {}
