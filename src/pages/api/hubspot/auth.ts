import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect, cookies }) => {
  const clientId = import.meta.env.HUBSPOT_CLIENT_ID;
  const redirectUri = `${import.meta.env.PUBLIC_SITE_URL}/api/hubspot/callback`;
  const scope = 'content';

  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return redirect(authUrl);
};