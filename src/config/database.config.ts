import "./app.config.ts";

export const databaseConfig = {
  url: process.env.DATABASE_URL as string,
  mongoUrl: process.env.MONGODB_URL as string,
  mongoDatabase: process.env.MONGODB_DATABASE ?? 'pulsemesh',
};
