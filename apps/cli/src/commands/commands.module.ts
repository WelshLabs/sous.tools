import { Module } from '@nestjs/common';
import { IngestionModule } from '../ingestion/ingestion.module';
import { ImportTextbookCommand } from './import-textbook.command';
import { AgentTailCommand } from './agent/agent-tail.command';
import { ContextSummaryCommand } from './context/context-summary.command';
import { DbSyncNeo4jCommand } from './database/db-sync-neo4j.command';
import { DbPushCommand } from './database/db-push.command';
import { DbTypesCommand } from './database/db-types.command';
import { DbResetCommand } from './database/db-reset.command';
import { StackUpCommand } from './stack/stack-up.command';
import { StackDownCommand } from './stack/stack-down.command';
import { StackLogsCommand } from './stack/stack-logs.command';
import { StackNukeCommand } from './stack/stack-nuke.command';
import { Pm2DevCommand } from './pm2/pm2-dev.command';
import { Pm2StatusCommand } from './pm2/pm2-status.command';
import { Pm2RestartCommand } from './pm2/pm2-restart.command';
import { Pm2StopCommand } from './pm2/pm2-stop.command';
import { Pm2LogsCommand } from './pm2/pm2-logs.command';
import { GitPushCommand } from './git/git-push.command';
import { GitAutoCommand } from './git/git-auto.command';
import { McpSyncCommand } from './mcp/mcp-sync.command';
import { ProdSshCommand } from './prod/prod-ssh.command';

@Module({
  imports: [IngestionModule],
  providers: [
    ImportTextbookCommand,
    AgentTailCommand,
    ContextSummaryCommand,
    DbSyncNeo4jCommand,
    DbPushCommand,
    DbTypesCommand,
    DbResetCommand,
    StackUpCommand,
    StackDownCommand,
    StackLogsCommand,
    StackNukeCommand,
    Pm2DevCommand,
    Pm2StatusCommand,
    Pm2RestartCommand,
    Pm2StopCommand,
    Pm2LogsCommand,
    GitPushCommand,
    GitAutoCommand,
    McpSyncCommand,
    ProdSshCommand,
  ],
})
export class CommandsModule {}
