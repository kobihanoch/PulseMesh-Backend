import dns from 'dns';
import { RequestHandler } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import postgres from 'postgres';
import { databaseConfig } from '../../config/database.config.ts';
import { appConfig } from '../../config/app.config.ts';

dns.setDefaultResultOrder('ipv4first');

const connectionString = databaseConfig.url;

// Base pool client (PgBouncer safe)
function makeClient(): postgres.Sql {
  return postgres(connectionString!, {
    ssl: appConfig.isProduction ? 'require' : false,
    prepare: false,
    connect_timeout: 30,
  });
}

// SQL Instance and logger
let _sql = makeClient();

// Async local storage for inner handler
const als = new AsyncLocalStorage<{
  tx: postgres.TransactionSql;
  userId?: string;
}>();

// Global tagged template: prefers the request-bound tx when present
const sql = (async (strings: TemplateStringsArray, ...values: any[]) => {
  // Check if exists running transaction
  const store = als.getStore(); //
  const runner = store?.tx || _sql;
  return runner(strings, ...values);
}) as postgres.Sql;

// Begin transaction
export const beginTransaction = async <T>(operation: () => Promise<T>): Promise<T> => {
  const store = als.getStore();

  if (store) {
    return operation();
  }

  const result = await _sql.begin((tx) => als.run({ tx }, operation));

  return result as T;
};

// Wrap a protected route with a single tx + injected claims (RLS)
export const withRlsTx = <P, Res, Req, Q>(handler: RequestHandler<P, Res, Req, Q>): RequestHandler<P, Res, Req, Q> => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    return await _sql.begin(async (tx) => {
      if (userId) {
        await tx`select set_config('app.user_id', ${userId}, true)`;
        await tx`SET LOCAL ROLE app_authenticated`;
      } else {
        await tx`SET LOCAL ROLE app_guest`;
      }

      return als.run({ tx }, async () => {
        return handler(req, res, next);
      });
    });
  };
};

// -------------- DB CONNECTION ------------------------

export const connectDB = async (): Promise<void> => {
  try {
    await sql<{ connected: number }[]>`select 1 as connected`;
    console.log('Connected to Postgres');
  } catch (err: any) {
    console.error('Connection to Postgres failed', err);
  }
};

export default sql as postgres.Sql;
