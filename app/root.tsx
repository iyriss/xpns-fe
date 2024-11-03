import { Links, Meta, Outlet, Scripts } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';
import stylesheet from './tailwind.css?url';
import { NavLayout } from './layouts/NavLayout';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: String(stylesheet) }];

export default function App() {
  return (
    <html>
      <head>
        <link rel='icon' href='data:image/x-icon;base64,AA' />
        <Meta />
        <Links />
      </head>
      <body className='font-quicksand bg-[#f6f8fa]'>
        <NavLayout>
          <Outlet />
        </NavLayout>

        <Scripts />
      </body>
    </html>
  );
}
