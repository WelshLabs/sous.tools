import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { serverConfig as config } from "@soustools/config/server";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile:
        config.NODE_ENV === "development"
          ? join(process.cwd(), "src/schema.gql")
          : true,
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        "graphql-ws": true,
      },
    }),
  ],
})
export class AppGraphQLModule {}
