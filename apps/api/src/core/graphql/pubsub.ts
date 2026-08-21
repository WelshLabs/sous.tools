import { Provider } from "@nestjs/common";
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis, { RedisOptions } from "ioredis";
import { serverConfig as config } from "@soustools/config/server";

export const PUB_SUB = "PUB_SUB";

export function createRedisPubSub(): RedisPubSub {
  const redisOptions: RedisOptions = {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    family: 4,
    retryStrategy: (times: number) => {
      console.warn(
        `[RedisPubSub] Connection failed (attempt ${times}). Retrying gracefully...`,
      );
      return Math.min(times * 100, 3000);
    },
  };

  return new RedisPubSub({
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions),
  });
}

export const pubSubProvider: Provider = {
  provide: PUB_SUB,
  useFactory: () => createRedisPubSub(),
};

export type { RedisPubSub };
