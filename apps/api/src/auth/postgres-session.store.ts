import * as session from 'express-session';

const { Pool } = require('pg') as {
  Pool: new (options: { connectionString: string }) => {
    query: (text: string, params?: unknown[]) => Promise<unknown>;
  };
};

type SessionPayload = session.SessionData;

type SessionRow = {
  sid: string;
  sess: SessionPayload;
  expire: Date;
};

export class PostgresSessionStore extends session.Store {
  private readonly pool: InstanceType<typeof Pool>;

  constructor(connectionString: string) {
    super();
    this.pool = new Pool({ connectionString });
  }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS "app_sessions" (
        "sid" TEXT PRIMARY KEY,
        "sess" JSONB NOT NULL,
        "expire" TIMESTAMP(3) NOT NULL
      );
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS "app_sessions_expire_idx"
      ON "app_sessions" ("expire");
    `);
  }

  override get(
    sid: string,
    callback: (err: unknown, session?: SessionPayload | null) => void,
  ): void {
    void this.pool
      .query(
        `
        SELECT "sid", "sess", "expire"
        FROM "app_sessions"
        WHERE "sid" = $1 AND "expire" > NOW()
        LIMIT 1
      `,
        [sid],
      )
      .then((result) => {
        const rows = result as { rows: SessionRow[] };
        callback(null, rows.rows[0]?.sess ?? null);
      })
      .catch((error: unknown) => callback(error));
  }

  override set(
    sid: string,
    sess: SessionPayload,
    callback?: (err?: unknown) => void,
  ): void {
    const expire = this.getExpiry(sess);

    void this.pool
      .query(
        `
        INSERT INTO "app_sessions" ("sid", "sess", "expire")
        VALUES ($1, $2::jsonb, $3)
        ON CONFLICT ("sid")
        DO UPDATE SET
          "sess" = EXCLUDED."sess",
          "expire" = EXCLUDED."expire"
      `,
        [sid, JSON.stringify(sess), expire],
      )
      .then(() => callback?.())
      .catch((error: unknown) => callback?.(error));
  }

  override destroy(sid: string, callback?: (err?: unknown) => void): void {
    void this.pool
      .query(`DELETE FROM "app_sessions" WHERE "sid" = $1`, [sid])
      .then(() => callback?.())
      .catch((error: unknown) => callback?.(error));
  }

  override touch(
    sid: string,
    sess: SessionPayload,
    callback?: (err?: unknown) => void,
  ): void {
    const expire = this.getExpiry(sess);

    void this.pool
      .query(
        `
        UPDATE "app_sessions"
        SET "expire" = $2
        WHERE "sid" = $1
      `,
        [sid, expire],
      )
      .then(() => callback?.())
      .catch((error: unknown) => callback?.(error));
  }

  private getExpiry(sess: SessionPayload): Date {
    if (sess.cookie.expires) return new Date(sess.cookie.expires);

    const maxAge = sess.cookie.maxAge ?? 7 * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + maxAge);
  }
}
