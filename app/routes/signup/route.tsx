import { ActionFunction, LoaderFunction, json, redirect } from '@vercel/remix';
import { Form, Link, useActionData } from '@remix-run/react';
import { Button } from '../../components/Button';

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  const name = form.get('name');

  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return json({ error: 'Invalid form submission' }, { status: 400 });
  }

  try {
    const response = await fetch(`${process.env.API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json({ error: data.error || 'Invalid credentials' });
    }

    return redirect('/', {
      headers: {
        // Forward any headers from the API response
        ...(response.headers.get('Set-Cookie')
          ? { 'Set-Cookie': response.headers.get('Set-Cookie') }
          : {}),
      },
    });
  } catch (error) {
    return json({ error: 'Error creating account' }, { status: 500 });
  }
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();

  return (
    <div className='mx-auto mt-8 max-w-md'>
      <h2 className='mb-4 text-2xl font-bold'>Create Account</h2>
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
        <Button type='submit' className='w-full rounded bg-primary p-2 text-white'>
          Create Account
        </Button>
        <div className='text-center'>
          <p>
            Already have an account?{' '}
            <Link to='/login' className='text-primary hover:underline'>
              Log in
            </Link>
          </p>
        </div>
      </Form>
    </div>
  );
}
