import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';

export const onRequest = defineMiddleware(async ({ request, redirect }, next) => {
  const { pathname } = new URL(request.url);
  
  if (pathname === '/') return next();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session && pathname !== '/login') {
    return redirect('/');
  }

  const response = await next();
  return response;
});