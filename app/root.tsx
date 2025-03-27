import { Links, Meta, Outlet, Scripts, useLoaderData } from '@remix-run/react';
import { json, redirect, LoaderFunction, LinksFunction } from '@remix-run/node';
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
    console.log('Incoming request cookie:', cookie);
    console.log('All incoming headers:', Object.fromEntries(request.headers.entries()));

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
      <body className='bg-[#f6f8fa] font-quicksand'>
        <NavLayout userName={user?.name}>
          <Outlet />
        </NavLayout>

        <Scripts />
      </body>
    </html>
  );
}
