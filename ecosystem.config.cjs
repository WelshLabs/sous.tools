module.exports = {
  apps: [
    {
      name: "api",
      script: "pnpm",
      args: "run --filter api dev",
      env: {
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
    },
    {
      name: "web",
      script: "pnpm",
      args: "run --filter web dev",
      env: {
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
    },
    {
      name: "setup-portal",
      script: "pnpm",
      args: "run --filter @soustools/setup-portal dev",
      env: {
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
    },
  ],
};
