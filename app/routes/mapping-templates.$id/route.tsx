import { ActionFunction, json } from '@vercel/remix';
import z from 'zod';

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === 'DELETE') {
    const { id } = params;
    try {
      const res = await fetch(`${process.env.API_URL}/api/mapping-templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('Cookie') || '',
        },
      });

      if (!res.ok) {
        return json(
          { error: 'Failed to delete mapping template', success: false },
          { status: 400 },
        );
      }

      return json({ success: true });
    } catch (error) {
      return json({ error: 'Failed to delete mapping template', success: false }, { status: 400 });
    }
  }
};
