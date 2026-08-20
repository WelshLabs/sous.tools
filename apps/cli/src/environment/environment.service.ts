import { Injectable } from "@nestjs/common";
import { spawn, spawnSync, SpawnOptions } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

@Injectable()
export class EnvironmentService {
  private cachedSousRoot: string | null = null;

  /**
   * Determine whether execution is running inside a Docker container.
   */
  isDocker(): boolean {
    if (process.env.IS_DOCKER === "true" || process.env.IS_DOCKER === "1") {
      return true;
    }
    if (fs.existsSync("/.dockerenv")) {
      return true;
    }
    if (fs.existsSync("/sous.tools") || fs.existsSync("/workspace")) {
      return true;
    }
    try {
      if (fs.existsSync("/proc/1/cgroup")) {
        const cgroup = fs.readFileSync("/proc/1/cgroup", "utf8");
        if (cgroup.includes("docker") || cgroup.includes("containerd")) {
          return true;
        }
      }
    } catch {
      // Ignore read errors in restricted environments
    }
    return false;
  }

  /**
   * Resolve the sous.tools repository root directory (SOUS_ROOT).
   */
  getSousRoot(): string {
    if (this.cachedSousRoot) {
      return this.cachedSousRoot;
    }

    if (process.env.SOUS_ROOT && fs.existsSync(process.env.SOUS_ROOT)) {
      this.cachedSousRoot = process.env.SOUS_ROOT;
      return this.cachedSousRoot;
    }

    if (fs.existsSync("/sous.tools")) {
      this.cachedSousRoot = "/sous.tools";
      return this.cachedSousRoot;
    }

    if (fs.existsSync("/workspace")) {
      this.cachedSousRoot = "/workspace";
      return this.cachedSousRoot;
    }

    let currentDir = process.cwd();
    while (currentDir !== path.parse(currentDir).root) {
      if (
        fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml")) ||
        fs.existsSync(path.join(currentDir, "turbo.json"))
      ) {
        this.cachedSousRoot = currentDir;
        return this.cachedSousRoot;
      }
      currentDir = path.dirname(currentDir);
    }

    const homeSousRoot = path.join(os.homedir(), "welshlabs/sous.tools");
    if (fs.existsSync(homeSousRoot)) {
      this.cachedSousRoot = homeSousRoot;
      return this.cachedSousRoot;
    }

    this.cachedSousRoot = process.cwd();
    return this.cachedSousRoot;
  }

  /**
   * Spawn a child process interactively (inheriting stdio) and wait for completion.
   */
  async spawnInteractive(
    command: string,
    args: string[] = [],
    options?: SpawnOptions,
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: "inherit",
        shell: true,
        cwd: options?.cwd || this.getSousRoot(),
        env: {
          ...process.env,
          SOUS_ROOT: this.getSousRoot(),
          ...options?.env,
        },
        ...options,
      });

      child.on("close", (code) => {
        resolve(code ?? 0);
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Execute a command synchronously and return the stdout string.
   */
  execSync(
    command: string,
    options?: { cwd?: string; env?: NodeJS.ProcessEnv },
  ): string {
    const res = spawnSync(command, {
      shell: true,
      encoding: "utf8",
      cwd: options?.cwd || this.getSousRoot(),
      env: {
        ...process.env,
        SOUS_ROOT: this.getSousRoot(),
        ...options?.env,
      },
    });

    if (res.error) {
      throw res.error;
    }

    return res.stdout ? res.stdout.trim() : "";
  }
}
