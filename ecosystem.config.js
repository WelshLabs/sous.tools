module.exports = {
  apps: [
    {
      name: "api",
      script: "pnpm --filter api run dev",
    },
    {
      name: "web",
      script: "pnpm --filter web run dev",
    },
    {
      name: "pos",
      script: "pnpm --filter pos-simulator run dev",
    },
    {
      name: "setup",
      script: "pnpm --filter setup-portal run dev",
    },
  ],
};
