import { Query, Resolver } from '@nestjs/graphql';
import { HealthStatus } from './health.types';

@Resolver(() => HealthStatus)
export class HealthResolver {
  @Query(() => HealthStatus)
  healthCheck(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
