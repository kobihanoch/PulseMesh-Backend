import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const appConfig = {
  nodeEnv,
  isDevelopment: nodeEnv === "development",
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  port: Number(process.env.PORT ?? 5000),
  minAppVersion: process.env.MIN_APP_VERSION ?? "0.0.0",
};
