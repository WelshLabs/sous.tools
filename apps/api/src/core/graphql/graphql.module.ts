import { Module, Global } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { pubSubProvider, PUB_SUB } from "./pubsub";

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        "graphql-ws": true,
      },
      context: ({ req, res }: { req: any; res: any }) => ({ req, res }),
    }),
  ],
  providers: [pubSubProvider],
  exports: [GraphQLModule, pubSubProvider, PUB_SUB],
})
export class AppGraphQLModule {}
