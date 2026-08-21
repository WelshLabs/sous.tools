import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";

@Module({
  controllers: [AuthController],
  providers: [AuthResolver],
})
export class AuthModule {}
