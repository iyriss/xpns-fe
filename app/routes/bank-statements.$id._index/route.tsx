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

      const data = await res.json();

      if (data.success) {
        // Redirect immediately on success to prevent rendering with deleted data
        return redirect('/bank-statements');
      } else {
        let error = data.error || 'Failed to delete bank statement';
        if (
          error === 'Bank statement cannot be deleted because it contains grouped transactions.'
        ) {
          error =
            'Bank statement cannot be deleted because it contains grouped transactions. Please ungroup the transactions first.';
        }

        throw new Error(error);
      }
    } catch (error) {
      return json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error occurred while deleting bank statement',
        },
        { status: 400 },
      );
    }
  }

  return json({ success: false, error: 'Method not allowed' }, { status: 405 });
};
