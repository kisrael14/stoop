import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/login', '/auth/callback'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Skip auth check if Supabase isn't configured yet
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-project-url-here') {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Not logged in → redirect to login (except public routes)
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in but on login page → redirect to stoop
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/stoop', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
