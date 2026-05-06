import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type QueryResult<T = unknown> = {
  data: T | null;
  error: Error | null;
  count?: number | null;
};

type AuthCallback = (session: Session | null) => void;

const TOKEN_KEY = 'web_bac_si_admin_token';
const authListeners = new Set<AuthCallback>();

function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null): void {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Yêu cầu không thành công.');
  }

  return payload as T;
}

async function notifyAuthListeners(session: Session | null): Promise<void> {
  for (const listener of authListeners) listener(session);
}

async function currentSession(): Promise<Session | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = await apiRequest<{ session: Session | null }>('/api/auth/session');
    return payload.session;
  } catch {
    setToken(null);
    return null;
  }
}

class QueryBuilder<T = unknown> implements PromiseLike<QueryResult<T>> {
  private payload: Record<string, unknown>;

  constructor(table: string) {
    this.payload = {
      table,
      action: 'select',
      select: { columns: '*', options: {} },
      filters: [],
      orders: [],
    };
  }

  select(columns = '*', options: Record<string, unknown> = {}): this {
    this.payload.select = { columns, options };
    if (this.payload.action !== 'select') this.payload.returning = true;
    return this;
  }

  insert(values: unknown): this {
    this.payload.action = 'insert';
    this.payload.values = values;
    return this;
  }

  update(values: unknown): this {
    this.payload.action = 'update';
    this.payload.values = values;
    return this;
  }

  delete(): this {
    this.payload.action = 'delete';
    return this;
  }

  upsert(values: unknown, options: { onConflict?: string } = {}): this {
    this.payload.action = 'upsert';
    this.payload.values = values;
    this.payload.onConflict = options.onConflict;
    this.payload.returning = true;
    return this;
  }

  eq(column: string, value: unknown): this {
    return this.addFilter({ operator: 'eq', column, value });
  }

  lte(column: string, value: unknown): this {
    return this.addFilter({ operator: 'lte', column, value });
  }

  in(column: string, value: unknown[]): this {
    return this.addFilter({ operator: 'in', column, value });
  }

  is(column: string, value: unknown): this {
    return this.addFilter({ operator: 'is', column, value });
  }

  not(column: string, innerOperator: string, value: unknown): this {
    return this.addFilter({ operator: 'not', innerOperator, column, value });
  }

  or(value: string): this {
    return this.addFilter({ operator: 'or', value });
  }

  order(column: string, options: { ascending?: boolean } = {}): this {
    (this.payload.orders as unknown[]).push({
      column,
      ascending: options.ascending !== false,
    });
    return this;
  }

  limit(value: number): this {
    this.payload.limit = value;
    return this;
  }

  single(): this {
    this.payload.resultMode = 'single';
    return this;
  }

  maybeSingle(): this {
    this.payload.resultMode = 'maybeSingle';
    return this;
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private addFilter(filter: Record<string, unknown>): this {
    (this.payload.filters as unknown[]).push(filter);
    return this;
  }

  private async execute(): Promise<QueryResult<T>> {
    try {
      const result = await apiRequest<QueryResult<T>>('/api/db/query', {
        method: 'POST',
        body: JSON.stringify(this.payload),
      });
      return {
        data: result.data,
        error: result.error ? new Error(String((result.error as Error).message)) : null,
        count: result.count ?? null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Yêu cầu không thành công.'),
        count: null,
      };
    }
  }
}

class StorageBucket {
  upload(path: string, file: File, options: { upsert?: boolean; contentType?: string } = {}) {
    return this.uploadFile(path, file, options);
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    return { data: { publicUrl: `${window.location.origin}/media/${encoded}` } };
  }

  async remove(paths: string[]): Promise<QueryResult<null>> {
    try {
      await apiRequest('/api/storage/remove', {
        method: 'POST',
        body: JSON.stringify({ paths }),
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Không xóa được ảnh.') };
    }
  }

  private async uploadFile(
    path: string,
    file: File,
    options: { upsert?: boolean; contentType?: string },
  ): Promise<QueryResult<{ path: string }>> {
    const form = new FormData();
    form.set('path', path);
    form.set('upsert', String(options.upsert ?? false));
    form.set('file', file, file.name);

    try {
      const result = await apiRequest<QueryResult<{ path: string }>>('/api/storage/upload', {
        method: 'POST',
        body: form,
      });
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Không tải được ảnh.') };
    }
  }
}

const apiClient = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
      return { data: { session: await currentSession() }, error: null };
    },
    async signInWithPassword(credentials: { email: string; password: string }) {
      try {
        const payload = await apiRequest<{ session: Session }>('/api/auth/sign-in', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        setToken(payload.session.access_token);
        await notifyAuthListeners(payload.session);
        return { data: { session: payload.session }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },
    async signOut(): Promise<{ error: null }> {
      setToken(null);
      await notifyAuthListeners(null);
      return { error: null };
    },
    async resetPasswordForEmail(email: string): Promise<{ error: null }> {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }).catch(() => undefined);
      return { error: null };
    },
    onAuthStateChange(callback: (_event: string, session: Session | null) => void) {
      const listener: AuthCallback = session => callback('SIGNED_IN', session);
      authListeners.add(listener);
      return {
        data: {
          subscription: {
            unsubscribe: () => authListeners.delete(listener),
          },
        },
      };
    },
  },
  storage: {
    from() {
      return new StorageBucket();
    },
  },
};

export const supabase = apiClient as unknown as SupabaseClient<Database>;

export function assertSupabase(
  client: SupabaseClient<Database> | null,
): asserts client is SupabaseClient<Database> {
  if (!client) throw new Error('API chưa sẵn sàng.');
}
