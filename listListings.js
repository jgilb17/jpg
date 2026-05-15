const GUESTY_TOKEN_URL = "https://open-api.guesty.com/oauth2/token";
const GUESTY_LISTINGS_URL = "https://open-api.guesty.com/v1/listings";

async function getAccessToken() {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET environment variables"
    );
  }

  const res = await fetch(GUESTY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "open-api",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get access token (${res.status}): ${text}`);
  }

  const { access_token } = await res.json();
  return access_token;
}

async function fetchListings(token, { limit = 25, skip = 0 } = {}) {
  const url = new URL(GUESTY_LISTINGS_URL);
  url.searchParams.set("limit", limit);
  url.searchParams.set("skip", skip);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch listings (${res.status}): ${text}`);
  }

  return res.json();
}

async function listAllListings() {
  const token = await getAccessToken();

  let skip = 0;
  const limit = 25;
  let totalFetched = 0;
  let totalCount = null;

  console.log("Fetching Guesty listings...\n");

  do {
    const data = await fetchListings(token, { limit, skip });

    if (totalCount === null) {
      totalCount = data.count ?? data.results?.length ?? 0;
    }

    const listings = data.results ?? [];

    for (const listing of listings) {
      console.log(`- ${listing.nickname ?? listing.title ?? listing._id}`);
      if (listing.address?.full) {
        console.log(`  Address : ${listing.address.full}`);
      }
      if (listing.propertyType) {
        console.log(`  Type    : ${listing.propertyType}`);
      }
      if (listing.bedrooms != null) {
        console.log(`  Bedrooms: ${listing.bedrooms}`);
      }
      console.log(`  ID      : ${listing._id}`);
      console.log();
    }

    totalFetched += listings.length;
    skip += limit;

    if (listings.length < limit) break;
  } while (totalFetched < totalCount);

  console.log(`Total listings: ${totalFetched}`);
}

listAllListings().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
