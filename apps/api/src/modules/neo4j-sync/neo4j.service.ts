import { Injectable, OnApplicationShutdown, Logger } from "@nestjs/common";
import neo4j, { Driver } from "neo4j-driver";
import { config } from "@soustools/config";

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly logger = new Logger(Neo4jService.name);
  private readonly driver: Driver;

  constructor() {
    this.logger.log(`Initializing Neo4j connection to ${config.NEO4J_URI} as user ${config.NEO4J_USERNAME}`);
    this.driver = neo4j.driver(
      config.NEO4J_URI,
      neo4j.auth.basic(config.NEO4J_USERNAME, config.NEO4J_PASSWORD),
    );
  }

  /**
   * Executes a Cypher query in a write transaction and returns the result.
   */
  async runQuery(query: string, params?: Record<string, any>): Promise<any> {
    const session = this.driver.session();
    try {
      return await session.executeWrite((tx) => tx.run(query, params));
    } catch (error) {
      this.logger.error(`Failed to execute Cypher query: ${query}`, (error as Error).stack);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Returns the raw Neo4j driver instance.
   */
  getDriver(): Driver {
    return this.driver;
  }

  /**
   * Closes the Neo4j driver connection gracefully on application shutdown.
   */
  async onApplicationShutdown(): Promise<void> {
    this.logger.log("Closing Neo4j driver connection");
    await this.driver.close();
  }
}
