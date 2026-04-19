const TOKEN_KEY = 'autobaz-token';

const GQL_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/graphql';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function gqlRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null,
): Promise<TData> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(GQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
  } catch (e) {
    throw e instanceof Error ? e : new Error('Network error');
  }

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as GraphQLResponse<TData>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (json.data === undefined) {
    throw new Error('No data from GraphQL');
  }

  return json.data;
}

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
