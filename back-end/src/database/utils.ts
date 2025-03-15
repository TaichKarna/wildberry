import { QueryResult } from 'pg';

/**
 * Helper function to safely access row properties from query results
 * @param result Query result from database
 * @param index Index of the row to access (defaults to 0)
 * @returns The row as any type to allow property access
 */
export function getRow<T = any>(result: QueryResult, index: number = 0): T {
  if (!result || !result.rows || result.rows.length <= index) {
    throw new Error(`No row found at index ${index}`);
  }
  return result.rows[index] as unknown as T;
}

/**
 * Helper function to safely access all rows from query results
 * @param result Query result from database
 * @returns Array of rows as any type to allow property access
 */
export function getRows<T = any>(result: QueryResult): T[] {
  if (!result || !result.rows) {
    return [];
  }
  return result.rows as unknown as T[];
}

/**
 * Helper function to safely execute a query with a client
 * @param client Database client
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export async function clientQuery(client: any, text: string, params: any[] = []): Promise<QueryResult> {
  if (!client || typeof client.query !== 'function') {
    throw new Error('Invalid database client');
  }
  return await client.query(text, params);
}

/**
 * Helper function to safely commit a transaction
 * @param client Database client
 */
export async function commitTransaction(client: any): Promise<void> {
  if (!client || typeof client.query !== 'function') {
    throw new Error('Invalid database client');
  }
  await client.query('COMMIT');
}

/**
 * Helper function to safely rollback a transaction
 * @param client Database client
 */
export async function rollbackTransaction(client: any): Promise<void> {
  if (!client || typeof client.query !== 'function') {
    throw new Error('Invalid database client');
  }
  await client.query('ROLLBACK');
}
