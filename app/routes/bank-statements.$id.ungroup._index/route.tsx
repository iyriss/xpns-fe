import { ActionFunction, json, redirect } from '@vercel/remix';

export const action: ActionFunction = async ({ request, params }) => {
  const bankStatementId = params.id;

  if (request.method === 'PUT') {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/bank-statements/${bankStatementId}/ungroup`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Cookie: request.headers.get('Cookie') || '',
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        return json({ success: true, message: 'Transactions ungrouped successfully!' });
      } else {
        let error = data.error || 'An error occurred while ungrouping bank statement transactions';
        throw new Error(error);
      }
    } catch (error) {
      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Error occurred while ungrouping bank statement transactions',
        },
        { status: 400 },
      );
    }
  }

  return json({ success: false, error: 'Method not allowed' }, { status: 405 });
};
