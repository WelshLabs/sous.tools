import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../../apps/api/src/schema.gql",
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
      config: {
        add: {
          content: '"use client";',
        },
        withHooks: true,
        withComponent: false,
        withHOC: false,
        urqlImportFrom: "urql",
      },
    },
  },
};

export default config;
