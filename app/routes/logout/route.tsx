import { ActionFunction, createCookie, json, redirect } from '@vercel/remix';

const authCookie = createCookie('auth_token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export const action: ActionFunction = async ({ request }) => {
  const response = await fetch(`${process.env.API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Cookie: request.headers.get('Cookie') || '',
    },
  });

  if (!response.ok) {
    console.error('Logout failed:', await response.text());
    return json({ error: 'Failed to logout' }, { status: response.status });
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': [await authCookie.serialize('', { maxAge: 0 })],
    },
  });
};
