import { Links, LiveReload, Meta, Outlet, Scripts, useLoaderData } from '@remix-run/react';
import { json, redirect, LoaderFunction, LinksFunction } from '@vercel/remix';
import { Toaster } from 'sonner';
import { NavLayout } from './layouts/NavLayout';
import stylesheet from './tailwind.css?url';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: String(stylesheet) }];

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname === '/login' || url.pathname === '/signup') {
    return json({ user: null });
  }

  try {
    const cookie = request.headers.get('Cookie');

    const response = await fetch(`${process.env.API_URL}/api/auth/me`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: cookie || '',
      },
    });

    if (!response.ok) {
      return redirect('/login');
    }

    const user = await response.json();
    return json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    return redirect('/login');
  }
};

export default function Root() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <link rel='icon' href='data:image/x-icon;base64,AA' />
        <Meta />
        <Links />
      </head>
      <body className='font-quicksand'>
        <Scripts />
        <LiveReload />
        <NavLayout userName={user?.name}>
          <Outlet />
          <Toaster position='top-center' richColors />
        </NavLayout>
      </body>
    </html>
  );
}
