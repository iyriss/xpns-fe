import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, Link, useNavigation } from '@remix-run/react';
import { Button } from '../../components/Button';

export const loader: LoaderFunction = async ({ request }) => {
  const response = await fetch(`${process.env.API_URL}/api/auth/me`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });

  if (response.ok) {
    return redirect('/');
  }

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');

  const response = await fetch(`${process.env.API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    return json({ error: data.message || 'Invalid credentials' }, { status: response.status });
  }

  return redirect('/', {
    headers: {
      // Forward any headers from the API response
      ...(response.headers.get('Set-Cookie')
        ? { 'Set-Cookie': response.headers.get('Set-Cookie') }
        : {}),
    },
  });
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className='mx-auto mt-8 max-w-md'>
      <Form method='post' className='space-y-4'>
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
        <Button
          type='submit'
          className='w-full rounded bg-primary p-2 text-white'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
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
