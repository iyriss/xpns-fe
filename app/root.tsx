import { Links, Meta, Outlet, Scripts } from '@remix-run/react';
import { LinksFunction, LoaderFunction, redirect } from '@remix-run/node';
import stylesheet from './tailwind.css?url';
import { NavLayout } from './layouts/NavLayout';
import { getUserId } from './utils/session.server';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: String(stylesheet) }];

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const url = new URL(request.url);

  if (url.pathname === '/login') {
    return { userId };
  }

  if (!userId) {
    return redirect('/login');
  }

  return { userId };
};

export default function Root() {
  return (
    <html>
      <head>
        <link rel='icon' href='data:image/x-icon;base64,AA' />
        <Meta />
        <Links />
      </head>
      <body className='bg-[#f6f8fa] font-quicksand'>
        <NavLayout>
          <Outlet />
        </NavLayout>

        <Scripts />
      </body>
    </html>
  );
}
