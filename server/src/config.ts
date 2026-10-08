// All configuration comes from environment variables, read in one place,
// so the rest of the server never touches process.env directly.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  version: process.env.APP_VERSION ?? "dev",
  // Folder with the built client (client/dist). Set in production so one
  // Node process serves both the website and the API; unset in development,
  // where Vite serves the client.
  clientDist: process.env.CLIENT_DIST,
};
