import { gqlRequest } from '@/lib/graphql';
const TOKEN_KEY = 'autobaz-token';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!, $fullName: String!) {
    register(email: $email, password: $password, fullName: $fullName) {
      accessToken
      user {
        id
        fullName
        email
        role
        createdAt
      }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        fullName
        email
        role
        createdAt
      }
    }
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      fullName
      email
      role
      createdAt
    }
  }
`;

export const saveAccessToken = (token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
};

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> => {
  const data = await gqlRequest<{
    register: { accessToken: string; user: AuthUser };
  }>(REGISTER_MUTATION, {
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName,
  });

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, data.register.accessToken);
  }

  return data.register;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> => {
  const data = await gqlRequest<{
    login: { accessToken: string; user: AuthUser };
  }>(LOGIN_MUTATION, {
    email: payload.email,
    password: payload.password,
  });

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, data.login.accessToken);
  }

  return data.login;
};

export const fetchCurrentUser = async (
  accessToken?: string | null,
): Promise<AuthUser | null> => {
  const token =
    accessToken ??
    (typeof window !== 'undefined'
      ? window.localStorage.getItem(TOKEN_KEY)
      : null);

  if (!token) return null;

  try {
    const data = await gqlRequest<{ me: AuthUser | null }>(
      ME_QUERY,
      undefined,
      token,
    );
    return data.me ?? null;
  } catch {
    return null;
  }
};
