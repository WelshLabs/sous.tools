import { Module } from "@nestjs/common";
import { UsersResolver } from "./users.resolver";

@Module({
  controllers: [],
  providers: [UsersResolver],
  exports: [UsersResolver],
})
export class UsersModule {}
