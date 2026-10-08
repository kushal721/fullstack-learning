// All configuration comes from environment variables, read in one place,
// so the rest of the server never touches process.env directly.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  version: process.env.APP_VERSION ?? "dev",
};
