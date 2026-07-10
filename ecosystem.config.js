module.exports = {
  apps: [
    {
      name: 'api',
      script: 'pnpm',
      args: '--filter api run dev', // Targets apps/api in your pnpm workspace
      env: {
        PORT: 6001,
        NODE_ENV: 'development'
      }
    },
    {
      name: 'web',
      script: 'pnpm',
      args: '--filter web run dev', // Targets your main Next.js app
      env: {
        PORT: 3000,
        NODE_ENV: 'development'
      }
    },
    {
      name: 'pos',
      script: 'pnpm',
      args: '--filter pos-simulator run dev', // Targets your dev-pos simulator app
      env: {
        PORT: 3003,
        NODE_ENV: 'development'
      }
    },
    {
      name: 'setup',
      script: 'pnpm',
      args: '--filter setup-portal run dev', // Targets your dev-setup portal app
      env: {
        PORT: 3002,
        NODE_ENV: 'development'
      }
    }
  ]
};