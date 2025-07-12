import { ActionFunction, json } from '@vercel/remix';

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
        return json({ success: true, message: 'Bank statement deleted successfully!' });
      } else {
        let error = data.error || 'Failed to delete bank statement';
        if (
          error === 'Bank statement cannot be deleted because it contains grouped transactions.'
        ) {
          error =
            'Bank statement cannot be deleted because it contains grouped transactions. Please ungroup the transactions first.';
        }

        return json({ success: false, error }, { status: 400 });
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
  } else if (request.method === 'PUT') {
    const formData = await request.formData();
    try {
      const res = await fetch(`${process.env.API_URL}/api/bank-statements/${bankStatementId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('Cookie') || '',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const data = await res.json();

      if (data.success) {
        return json({ success: true, message: 'Bank statement updated successfully!' });
      } else {
        throw new Error(data.error || 'Failed to update bank statement');
      }
    } catch (error) {
      return json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error occurred while updating bank statement',
        },
        { status: 400 },
      );
    }
  }

  return json({ success: false, error: 'Method not allowed' }, { status: 405 });
};
