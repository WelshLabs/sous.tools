import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile:
        process.env.NODE_ENV === "development"
          ? join(process.cwd(), "src/schema.gql")
          : true,
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
  ],
})
export class AppGraphQLModule {}
