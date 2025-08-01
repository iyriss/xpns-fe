import { useFetcher, useLoaderData } from '@remix-run/react';
import z from 'zod';
import { ActionFunction, json, LoaderFunction } from '@vercel/remix';
import { DocumentTextIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { MappingTemplate } from '../upload._index/types';

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');
  const mappingTemplates = await fetch(`${process.env.API_URL}/api/mapping-templates`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
  });

  const { data } = await mappingTemplates.json();
  return { mappingTemplates: data || [] };
};

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

export default function MappingTemplatesRoute() {
  const { mappingTemplates } = useLoaderData() as { mappingTemplates: MappingTemplate[] };

  const fetcher = useFetcher();

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-5'>
        <h1 className='text-3xl font-light text-gray-900'>Mapping Templates</h1>
        <p className='mt-2 text-gray-500'>Save and reuse CSV column mappings for faster uploads</p>
      </div>

      {mappingTemplates.length === 0 ? (
        <div className='rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm'>
          <DocumentTextIcon className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-4 text-lg font-medium text-gray-900'>No mapping templates</h3>
          <p className='mt-2 text-gray-500'>
            You can create your mapping templates by mapping your columns when you upload a CSV
            file.
          </p>
        </div>
      ) : (
        <div className='space-y-5'>
          {mappingTemplates.map((template) => (
            <div
              key={template._id}
              className='group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md'
            >
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-gray-900'>{template.name}</h3>
                  <p className='mt-1 text-sm text-gray-500'>{template.headers.length} columns</p>
                </div>
                <fetcher.Form
                  className='opacity-0 transition-opacity group-hover:opacity-100'
                  method='delete'
                  action={`/mapping-templates/${template._id}`}
                >
                  <button
                    type='submit'
                    className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </button>
                </fetcher.Form>
              </div>

              <div className='flex'>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-700'>Mapping</p>
                  <table className='border-collapse border border-gray-200'>
                    <thead>
                      <tr>
                        <th className='tex-sm border border-gray-200 px-2 py-1 text-left font-medium'>
                          Column
                        </th>
                        <th className='tex-sm border border-gray-200 px-2 py-1 text-left font-medium'>
                          Value
                        </th>
                      </tr>
                    </thead>
                    {Object.entries(template.mapping).map(([key, value]) => {
                      return (
                        <tbody key={key}>
                          <tr>
                            <td className='border border-gray-200 px-2 py-1'>{key}</td>
                            <td className='border border-gray-200 px-2 py-1'>{value}</td>
                          </tr>
                        </tbody>
                      );
                    })}
                  </table>
                </div>

                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-700'>Header row</p>
                  <p className='text-sm text-gray-700'>{template.hasHeaderRow ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
