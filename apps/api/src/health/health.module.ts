import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthResolver } from './health.resolver';

@Module({
  controllers: [HealthController],
  providers: [HealthResolver],
})
export class HealthModule {}
