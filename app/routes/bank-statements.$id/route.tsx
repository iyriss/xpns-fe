import { ActionFunction, json, redirect } from '@vercel/remix';

export const action: ActionFunction = async ({ request, params }) => {
  const bankStatementId = params.id;

  if (request.method === 'DELETE') {
    try {
      const res = await fetch(`${process.env.API_URL}/api/bank-statements/${bankStatementId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('Cookie') || '',
        },
      });

      if (res.ok) {
        // Redirect immediately on success to prevent rendering with deleted data
        return redirect('/bank-statements');
      } else {
        throw new Error('Failed to delete bank statement');
      }
    } catch (error) {
      return json(
        {
          success: false,
          error: 'Error occurred while deleting bank statement',
        },
        { status: 400 },
      );
    }
  }

  return json({ success: false, error: 'Method not allowed' }, { status: 405 });
};
