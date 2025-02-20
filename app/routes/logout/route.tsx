import { ActionFunction, redirect } from '@remix-run/node';
import { storage } from '../../utils/session.server';

export const action: ActionFunction = async ({ request }) => {
  const session = await storage.getSession(request.headers.get('Cookie'));
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
};
