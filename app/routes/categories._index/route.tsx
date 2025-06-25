import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@vercel/remix';
import { Button } from '../../components/Button';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/categories`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });

  const { data } = await res.json();

  return { categories: data };
};

const typeEmojis: { [key: string]: string } = {
  essentials: '🏡',
  lifestyle: '🛍️',
  wellness: '🩺',
  financial: '💰',
  pet: '🐶',
  other: '🧩',
};

export default function () {
  const { categories } = useLoaderData() as any;

  const groupedCategories = categories.reduce((acc: any, category: any) => {
    const type = category.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category.name);
    return acc;
  }, {});

  Object.keys(groupedCategories).forEach((type) => groupedCategories[type].sort());

  return (
    <div className='mx-auto mb-10 h-fit w-full max-w-7xl rounded-3xl border border-border/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl'>
      <h1 className='my-4 text-2xl font-semibold'>Categories</h1>

      <table className='w-full'>
        <tbody>
          {Object.entries(groupedCategories).map(([type, categories], idx) => (
            <tr key={idx} className='cursor-pointer border-b border-border/40 hover:bg-border/20'>
              <td className='w-full px-2 py-5'>
                <div className='flex-1'>
                  <div className='mb-3 flex items-center space-x-3'>
                    <div className='h-5 w-5 text-lg text-primary'>{typeEmojis[type] || '📁'}</div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-medium transition-colors'>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </h3>

                        <div className='flex items-center gap-1'>
                          <span className='text-sm text-primary'>+</span>
                          <Button variant='text' className='px-0 text-sm'>
                            Add category
                          </Button>
                        </div>
                      </div>
                      <div className='mt-2 flex items-center space-x-4 text-sm text-muted'>
                        <div className='flex items-center space-x-2'>
                          <span>{(categories as string[]).join(' • ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
