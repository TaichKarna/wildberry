import { Pool, PoolClient, QueryResult } from 'pg';
import { databaseUrl } from '../config';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const query = async <T extends QueryResult>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const client: PoolClient = await pool.connect();
  try {
    return (await client.query(text, params)) as QueryResult<T>;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

pool.on('connect', () => console.log('Connected to the PostgreSQL database'));
pool.on('remove', () => console.log('Client removed from the pool'));
pool.on('error', (err) =>
  console.error('Unexpected error on idle client', err)
);

export const shutdownPool = async () => {
  await pool.end();
  console.log('PostgreSQL pool has been closed');
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  try {
    await shutdownPool();
    console.log('PostgreSQL pool closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  } finally {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Exiting...');
  await shutdownPool();
  process.exit(0);
});
