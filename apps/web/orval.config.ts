const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

const config = {
  api: {
    input: `${apiUrl}/api-json`,
    output: {
      mode: "split",
      target: "src/api/generated.ts",
      client: "react-query",
      baseUrl: apiUrl,
      override: {
        mutator: {
          path: "src/api/mutator.ts",
          name: "mutator",
        },
      },
      // schemas: {
      //   path: "./model",
      //   type: "zod", // 'typescript' | 'zod'
      // },
    },
  },
  apiZod: {
    input: { target: `${apiUrl}/api-json` },
    output: {
      client: "zod",
      mode: "tags-split",
      target: "src/api/models",
      fileExtension: ".zod.ts",
    },
  },
};

export default config;
