import path from "node:path";

export type Row = Record<string, unknown>;

export interface Database {
  readonly kind: "postgres" | "pglite";
  readonly label: string;
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
}

export class QueryError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "QueryError";
  }
}

const globalForDb = globalThis as unknown as {
  __larkspurDb?: Promise<Database>;
};

async function openPostgres(url: string): Promise<Database> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    max: Number(process.env.PGPOOL_MAX ?? 8),
    ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
  });
  // Fail fast if the connection string is wrong.
  await pool.query("select 1");
  return {
    kind: "postgres",
    label: new URL(url).hostname + new URL(url).pathname,
    async query<T extends Row>(sql: string, params: unknown[] = []) {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
  };
}

async function openPglite(): Promise<Database> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = path.resolve(
    process.cwd(),
    process.env.PGLITE_DIR ?? path.join("var", "pglite"),
  );
  const db = new PGlite(dataDir);
  await db.waitReady;
  return {
    kind: "pglite",
    label: `embedded · ${path.relative(process.cwd(), dataDir)}`,
    async query<T extends Row>(sql: string, params: unknown[] = []) {
      const result = await db.query<T>(sql, params);
      return result.rows;
    },
    async exec(sql: string) {
      await db.exec(sql);
    },
  };
}

/**
 * One database for the whole process.
 *
 * Set DATABASE_URL to talk to a real Postgres server. With no DATABASE_URL we
 * fall back to an embedded PGlite database on disk, which is what makes the
 * cloned repository run with nothing else installed.
 */
export function getDb(): Promise<Database> {
  if (!globalForDb.__larkspurDb) {
    const url = process.env.DATABASE_URL?.trim();
    globalForDb.__larkspurDb = (url ? openPostgres(url) : openPglite()).catch(
      (error) => {
        globalForDb.__larkspurDb = undefined;
        throw new QueryError(
          url
            ? "Could not reach the Postgres database. Check DATABASE_URL."
            : "Could not open the embedded database directory var/pglite.",
          error,
        );
      },
    );
  }
  return globalForDb.__larkspurDb;
}

export async function query<T extends Row = Row>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = await getDb();
  return db.query<T>(sql, params);
}

export async function queryOne<T extends Row = Row>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: unknown[] = []): Promise<number> {
  const db = await getDb();
  await db.query(sql, params);
  return 0;
}

/** Run a set of statements inside a transaction. */
export async function transaction<T>(
  work: (tx: { query: typeof query; one: typeof queryOne }) => Promise<T>,
): Promise<T> {
  const db = await getDb();
  await db.exec("begin");
  try {
    const result = await work({
      query: async <R extends Row>(sql: string, params: unknown[] = []) =>
        db.query<R>(sql, params),
      one: async <R extends Row>(sql: string, params: unknown[] = []) =>
        ((await db.query<R>(sql, params))[0] ?? null) as R | null,
    });
    await db.exec("commit");
    return result;
  } catch (error) {
    await db.exec("rollback");
    throw error;
  }
}
