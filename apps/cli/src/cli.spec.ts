import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentService } from './environment/environment.service';
import { AgentTailCommand } from './commands/agent/agent-tail.command';
import { DbSyncNeo4jCommand } from './commands/database/db-sync-neo4j.command';
import { DbPushCommand } from './commands/database/db-push.command';
import { DbTypesCommand } from './commands/database/db-types.command';
import { DbResetCommand } from './commands/database/db-reset.command';
import { StackUpCommand } from './commands/stack/stack-up.command';
import { StackDownCommand } from './commands/stack/stack-down.command';
import { StackLogsCommand } from './commands/stack/stack-logs.command';
import { StackNukeCommand } from './commands/stack/stack-nuke.command';
import { Pm2DevCommand } from './commands/pm2/pm2-dev.command';
import { Pm2StatusCommand } from './commands/pm2/pm2-status.command';
import { Pm2RestartCommand } from './commands/pm2/pm2-restart.command';
import { Pm2StopCommand } from './commands/pm2/pm2-stop.command';
import { Pm2LogsCommand } from './commands/pm2/pm2-logs.command';
import { ContextSummaryCommand } from './commands/context/context-summary.command';
import { GitPushCommand } from './commands/git/git-push.command';
import { GitAutoCommand } from './commands/git/git-auto.command';
import { McpSyncCommand } from './commands/mcp/mcp-sync.command';
import { ProdSshCommand } from './commands/prod/prod-ssh.command';
import { AppModule } from './app.module';

describe('CLI Environment & Commands', () => {
  let moduleRef: TestingModule;
  let envService: EnvironmentService;
  let agentTailCommand: AgentTailCommand;
  let dbSyncNeo4jCommand: DbSyncNeo4jCommand;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    envService = moduleRef.get<EnvironmentService>(EnvironmentService);
    agentTailCommand = moduleRef.get<AgentTailCommand>(AgentTailCommand);
    dbSyncNeo4jCommand = moduleRef.get<DbSyncNeo4jCommand>(DbSyncNeo4jCommand);
  });

  it('should instantiate AppModule and all command providers successfully', () => {
    expect(moduleRef).toBeDefined();
    expect(envService).toBeDefined();
    expect(agentTailCommand).toBeDefined();
    expect(dbSyncNeo4jCommand).toBeDefined();
    expect(moduleRef.get(DbPushCommand)).toBeDefined();
    expect(moduleRef.get(DbTypesCommand)).toBeDefined();
    expect(moduleRef.get(DbResetCommand)).toBeDefined();
    expect(moduleRef.get(StackUpCommand)).toBeDefined();
    expect(moduleRef.get(StackDownCommand)).toBeDefined();
    expect(moduleRef.get(StackLogsCommand)).toBeDefined();
    expect(moduleRef.get(StackNukeCommand)).toBeDefined();
    expect(moduleRef.get(Pm2DevCommand)).toBeDefined();
    expect(moduleRef.get(Pm2StatusCommand)).toBeDefined();
    expect(moduleRef.get(Pm2RestartCommand)).toBeDefined();
    expect(moduleRef.get(Pm2StopCommand)).toBeDefined();
    expect(moduleRef.get(Pm2LogsCommand)).toBeDefined();
    expect(moduleRef.get(ContextSummaryCommand)).toBeDefined();
    expect(moduleRef.get(GitPushCommand)).toBeDefined();
    expect(moduleRef.get(GitAutoCommand)).toBeDefined();
    expect(moduleRef.get(McpSyncCommand)).toBeDefined();
    expect(moduleRef.get(ProdSshCommand)).toBeDefined();
  });

  describe('EnvironmentService', () => {
    it('should detect SOUS_ROOT correctly', () => {
      const root = envService.getSousRoot();
      expect(root).toBeDefined();
      expect(typeof root).toBe('string');
      expect(root.length).toBeGreaterThan(0);
    });

    it('should report boolean for isDocker', () => {
      const isDocker = envService.isDocker();
      expect(typeof isDocker).toBe('boolean');
    });
  });

  describe('AgentTailCommand', () => {
    it('should parse container and file options', () => {
      expect(agentTailCommand.parseContainer('test-runner')).toBe(
        'test-runner',
      );
      expect(agentTailCommand.parseFile('/tmp/test.log')).toBe('/tmp/test.log');
    });

    it('should execute tail when run is invoked', async () => {
      const spawnSpy = jest
        .spyOn(envService, 'spawnInteractive')
        .mockResolvedValue(0);

      await agentTailCommand.run([], {
        container: 'custom-runner',
        file: '/tmp/custom.log',
      });

      expect(spawnSpy).toHaveBeenCalled();
    });
  });

  describe('DbSyncNeo4jCommand', () => {
    it('should parse options correctly', () => {
      expect(dbSyncNeo4jCommand.parseUrl('http://localhost:3001')).toBe(
        'http://localhost:3001',
      );
      expect(dbSyncNeo4jCommand.parseTable('recipes')).toBe('recipes');
      expect(dbSyncNeo4jCommand.parseSecret('test-secret')).toBe('test-secret');
    });
  });
});
