// Minimal Supabase client stub for database operations
// Authentication is now handled by Clerk
// This stub provides a minimal implementation for existing database features

// Create a stub that returns empty/null results for all operations
// This allows the app to build while database features can be configured later

const stubResult = { data: null, error: null };
const stubSessionResult = { data: { session: null }, error: null };
const stubUserResult = { data: { user: null }, error: null };

const createQueryStub = () => {
  const query = {
    select: () => query,
    eq: () => query,
    neq: () => query,
    gt: () => query,
    gte: () => query,
    lt: () => query,
    lte: () => query,
    like: () => query,
    ilike: () => query,
    is: () => query,
    in: () => query,
    contains: () => query,
    containedBy: () => query,
    single: () => Promise.resolve(stubResult),
    maybeSingle: () => Promise.resolve(stubResult),
    insert: () => Promise.resolve(stubResult),
    update: () => query,
    delete: () => query,
    upsert: () => Promise.resolve(stubResult),
    order: () => query,
    limit: () => query,
    range: () => query,
    then: (onFulfilled: (value: typeof stubResult) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(stubResult).then(onFulfilled, onRejected),
    catch: (onRejected: (reason: unknown) => unknown) => Promise.resolve(stubResult).catch(onRejected),
    finally: (onFinally: () => void) => Promise.resolve(stubResult).finally(onFinally),
  };
  return query;
};

// Stub Supabase client with minimal implementation
export const supabase = {
  auth: {
    getSession: () => Promise.resolve(stubSessionResult),
    getUser: () => Promise.resolve(stubUserResult),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    signUp: () => Promise.resolve(stubResult),
    signInWithPassword: () => Promise.resolve(stubResult),
    signOut: () => Promise.resolve(stubResult),
    resetPasswordForEmail: () => Promise.resolve(stubResult),
    updateUser: () => Promise.resolve(stubUserResult),
    setSession: () => Promise.resolve(stubSessionResult),
    resend: () => Promise.resolve(stubResult),
  },
  from: () => createQueryStub(),
  rpc: () => Promise.resolve(stubResult),
  functions: {
    invoke: () => Promise.resolve(stubResult),
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
  }),
  removeChannel: () => undefined,
} as const;
