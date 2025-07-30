import { ActionFunction, json } from '@vercel/remix';
import z from 'zod';

export const action: ActionFunction = async ({ request, params }) => {
  const body = await request.json();

  const MappingTemplateSchema = z.object({
    name: z.string(),
    mapping: z.record(z.string(), z.string()),
    headers: z.array(z.string()),
    hasHeaderRow: z.boolean(),
  });

  const { name, mapping, headers, hasHeaderRow } = MappingTemplateSchema.parse(body);

  try {
    const res = await fetch(`${process.env.API_URL}/api/mapping-templates`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('Cookie') || '',
      },
      body: JSON.stringify({ name, mapping, headers, hasHeaderRow }),
    });

    if (!res.ok) {
      return json(
        { error: 'Failed to create mapping template', success: false },
        { status: res.status },
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error in create mapping template action:', error);
    return json({ error: 'Error creating mapping template', success: false }, { status: 400 });
  }
};
