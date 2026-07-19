import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { config } from "@soustools/config";

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
    }),
  ],
})
export class AppGraphQLModule {}
