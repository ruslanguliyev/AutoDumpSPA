type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
};

type AuthSession = {
  accessToken: string;
  userId: string;
  createdAt: string;
};

const USERS_KEY = 'autodump-auth-users';
const SESSION_KEY = 'autodump-auth-session';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeEmail = (email: string) => String(email ?? '').trim().toLowerCase();

const createId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const createToken = () => {
  if (globalThis.crypto?.randomUUID) return `token_${globalThis.crypto.randomUUID()}`;
  return `token_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const readUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse users cache', error);
    return [];
  }
};

const writeUsers = (users: StoredUser[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const readSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch (error) {
    console.warn('Failed to parse auth session', error);
    return null;
  }
};

const writeSession = (session: AuthSession) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
};

const toAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  createdAt: user.createdAt,
});

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> => {
  await sleep(450);
  const email = normalizeEmail(payload.email);
  const users = readUsers();

  if (!email) {
    throw new Error('Email is required');
  }

  if (users.some((user) => user.email === email)) {
    throw new Error('Account already exists for this email');
  }

  const now = new Date().toISOString();
  const nextUser: StoredUser = {
    id: createId(),
    fullName: payload.fullName.trim() || 'AutoDump User',
    email,
    password: payload.password,
    createdAt: now,
  };

  users.push(nextUser);
  writeUsers(users);

  const accessToken = createToken();
  writeSession({ accessToken, userId: nextUser.id, createdAt: now });

  return { accessToken, user: toAuthUser(nextUser) };
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> => {
  await sleep(350);
  const email = normalizeEmail(payload.email);
  const users = readUsers();
  const user = users.find((item) => item.email === email);

  if (!user || user.password !== payload.password) {
    throw new Error('Invalid email or password');
  }

  const now = new Date().toISOString();
  const accessToken = createToken();
  writeSession({ accessToken, userId: user.id, createdAt: now });

  return { accessToken, user: toAuthUser(user) };
};

export const fetchCurrentUser = async (
  accessToken?: string | null
): Promise<AuthUser | null> => {
  await sleep(200);
  if (!accessToken) return null;

  const session = readSession();
  if (!session || session.accessToken !== accessToken) return null;

  const users = readUsers();
  const user = users.find((item) => item.id === session.userId);
  return user ? toAuthUser(user) : null;
};
