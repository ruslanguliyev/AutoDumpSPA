const GQL_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql';

async function gqlRequest(query, variables) {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

const GET_SELLERS_QUERY = `
query GetSellers {
  sellers {
    id userId type name city rating verified createdAt
  }
}
`;

const GET_SELLER_QUERY = `
query GetSeller($id: String!) {
  sellerById(id: $id) {
    id userId type name city rating verified createdAt
  }
}
`;

const mapSeller = (row) => ({
  id: row.id,
  name: row.name,
  city: row.city,
  rating: row.rating,
  verified: row.verified,
  type:
    row.type === 'DEALER'
      ? 'dealer'
      : row.type === 'PARTS_DEALER'
        ? 'reseller'
        : row.type === 'PRIVATE'
          ? 'reseller'
          : 'reseller',
  domain: row.type === 'PARTS_DEALER' ? 'parts' : 'cars',
  hasPublicPage: true,
  listingsCount: 0,
  logo: null,
  votes: 0,
  createdAt: row.createdAt,
});

export async function getSellers() {
  try {
    const data = await gqlRequest(GET_SELLERS_QUERY, {});
    const rows = data?.sellers ?? [];
    return rows.map(mapSeller);
  } catch {
    return [];
  }
}

export async function getSellerById(id) {
  const safeId = String(id ?? '').trim();
  if (!safeId) return null;
  try {
    const data = await gqlRequest(GET_SELLER_QUERY, { id: safeId });
    const row = data?.sellerById;
    if (!row) return null;
    return mapSeller(row);
  } catch {
    return null;
  }
}
