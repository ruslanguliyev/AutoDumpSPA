import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    fetchOptions: {
      mode: 'cors',
    },
  }),
  cache: new InMemoryCache(),
  connectToDevTools: import.meta.env.DEV,
});

