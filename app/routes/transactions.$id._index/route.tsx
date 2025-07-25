import { ActionFunction, json } from '@vercel/remix';

export const action: ActionFunction = async ({ request, params }) => {
  const transactionId = params.id;

  if (!transactionId) {
    return json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  try {
    if (request.method === 'DELETE') {
      const res = await fetch(`${process.env.API_URL}/api/transactions/${transactionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('Cookie') || '',
        },
      });

      if (!res.ok) {
        return json({ error: 'Failed to delete transaction' }, { status: res.status });
      }

      return json({ success: true });
    }
  } catch (error) {
    console.error('Error in delete action:', error);
    return json({ error: 'Error deleting transaction' }, { status: 400 });
  }
};
