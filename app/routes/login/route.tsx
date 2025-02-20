import { ActionFunction, json } from '@remix-run/node';
import { Form, useActionData, Link } from '@remix-run/react';
import { createUserSession } from '../../utils/session.server';

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  const name = form.get('name');

  const response = await fetch(`${process.env.API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const { userId } = await response.json();

  if (!userId) {
    return json({ error: 'Invalid credentials' });
  }

  const redirectTo = (form.get('redirectTo') as string) || '/';
  return createUserSession(userId, redirectTo);
};

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className='mx-auto mt-8 max-w-md'>
      <Form method='post' className='space-y-4'>
        <div>
          <label htmlFor='name'>Name</label>
          <input type='text' name='name' id='name' required className='w-full border p-2' />
        </div>
        <div>
          <label htmlFor='email'>Email</label>
          <input type='email' name='email' id='email' required className='w-full border p-2' />
        </div>
        <div>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            name='password'
            id='password'
            required
            className='w-full border p-2'
          />
        </div>
        {actionData?.error && <div className='text-red-500'>{actionData.error}</div>}
        <button type='submit' className='w-full rounded bg-primary p-2 text-white'>
          Log in
        </button>
        <div className='text-center'>
          <p>
            Don't have an account?{' '}
            <Link to='/signup' className='text-primary hover:underline'>
              Sign up
            </Link>
          </p>
        </div>
      </Form>
    </div>
  );
}
