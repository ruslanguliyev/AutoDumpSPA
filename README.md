# AUTODUMP (Vite)

## Local dev

```bash
npm install
npm run dev
```

## Parts page data source

The `/parts` page uses **TanStack Query** and can work in two modes:

- **Mock mode (default in DEV)**: no backend required.
- **GraphQL mode**: fetches data from `VITE_GRAPHQL_ENDPOINT`.

### Environment variables (optional)

Create `.env.local` (recommended) in the project root:

```bash
# GraphQL backend endpoint (used only when VITE_USE_PARTS_MOCKS=false)
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql

# Use mock parts data in development (default: true)
# Set to "false" to force real backend requests.
VITE_USE_PARTS_MOCKS=true
```

### If you see `ERR_NAME_NOT_RESOLVED` in console

This means the configured GraphQL host cannot be resolved/reached (for example, `fake-graphql.autodump.local`).

Fix options:

- Set `VITE_USE_PARTS_MOCKS=true` (or just remove `VITE_USE_PARTS_MOCKS=false`).
- Set `VITE_GRAPHQL_ENDPOINT` to a real, reachable endpoint.
