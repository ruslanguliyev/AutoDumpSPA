# AvtoBaz frontend (Vite)

## Local dev

```bash
npm install
npm run dev
```

## Backend connection

All GraphQL calls go through `src/lib/graphql.ts`. Set the endpoint in `.env`:

```bash
VITE_API_URL=http://localhost:4000/graphql
```

Parts, services and specialists use the real backend by default. Each can be
switched to local mock data with `VITE_USE_PARTS_MOCKS=true`,
`VITE_USE_SERVICES_MOCKS=true` or `VITE_USE_SPECIALISTS_MOCKS=true`.
Memberships have no backend yet and always use mocks unless
`VITE_USE_MEMBERSHIPS_MOCKS=false`.

Useful scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.
