import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Authorization code not found', { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: import.meta.env.HUBSPOT_CLIENT_ID,
        client_secret: import.meta.env.HUBSPOT_CLIENT_SECRET,
        redirect_uri: `${import.meta.env.PUBLIC_SITE_URL}/api/hubspot/callback`,
        code,
      }),
    });

    const data = await tokenResponse.json();
    
    if (data.access_token) {
      cookies.set('hubspot_token', data.access_token, {
        path: '/',
        maxAge: data.expires_in,
      });
      return redirect('/dashboard');
    }

    throw new Error('Failed to get access token');
  } catch (error) {
    return new Response('Authentication failed', { status: 500 });
  }
};