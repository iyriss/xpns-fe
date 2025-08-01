import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@vercel/remix';
import { Button } from '../../components/Button';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/solid';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/categories`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });

  const { data } = await res.json();

  return { categories: data };
};

const typeEmojis: { [key: string]: string } = {
  essentials: '🍎',
  lifestyle: '🛍️',
  wellness: '🩺',
  financial: '💰',
  pet: '🐶',
  home: '🏠',
  other: '🧩',
};

const typeColors: { [key: string]: string } = {
  essentials: 'bg-red-50 text-red-600 border-red-200',
  lifestyle: 'bg-purple-50 text-primary border-purple-200',
  wellness: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  financial: 'bg-blue-50 text-blue-600 border-blue-200',
  pet: 'bg-orange-50 text-orange-600 border-orange-200',
  home: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
};

const typeNames: { [key: string]: string } = {
  essentials: 'Essentials',
  lifestyle: 'Lifestyle',
  wellness: 'Wellness',
  financial: 'Financial',
  pet: 'Pet Care',
  home: 'Home & Garden',
  other: 'Other',
};

export default function () {
  const { categories } = useLoaderData() as any;
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const groupedCategories = categories.reduce((acc: any, category: any) => {
    const type = category.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category.name);
    return acc;
  }, {});

  Object.keys(groupedCategories).forEach((type) => groupedCategories[type].sort());

  const handleAddCategory = (type: string) => {
    setAddingCategory(type);
    setNewCategoryName('');
  };

  const handleSubmit = async (type: string) => {
    if (!newCategoryName.trim()) {
      return;
    }

    // try {
    //   const res = await fetch(`${process.env.API_URL}/api/categories`, {
    //     method: 'POST',
    //     credentials: 'include',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       name: newCategoryName.trim(),
    //       type: type,
    //     }),
    //   });

    //   if (res.ok) {
    //     toast.success('Category created successfully');
    //   } else {
    //     console.error('Failed to create category');
    //   }
    // } catch (error) {
    //   console.error('Error creating category:', error);
    // }
  };

  const handleCancel = () => {
    setAddingCategory(null);
    setNewCategoryName('');
  };

  return (
    <div className='mx-auto max-w-6xl p-6'>
      <div className='mb-12'>
        <h1 className='text-3xl font-light text-gray-900'>Categories</h1>
        <p className='mt-2 text-gray-500'>Organize your expenses with custom categories</p>
      </div>

      <div className='space-y-8'>
        {Object.entries(groupedCategories).map(([type, categories], idx) => (
          <div key={idx} className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${typeColors[type]}`}
                >
                  <span className='text-2xl'>{typeEmojis[type] || '📁'}</span>
                </div>
                <div>
                  <h2 className='text-xl font-medium text-gray-900'>{typeNames[type]}</h2>
                  <p className='text-sm text-gray-500'>
                    {(categories as string[]).length} categories
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleAddCategory(type)}
                variant='text'
                className='space-x-2 !px-0 text-sm'
              >
                <PlusIcon className='h-4 w-4' />
                <span>Add Category button that does not work yet</span>
              </Button>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {(categories as string[]).map((category, categoryIdx) => (
                <div
                  key={categoryIdx}
                  className='group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm'
                >
                  <span className='font-medium text-gray-900'>{category}</span>
                  <div className='opacity-0 transition-opacity group-hover:opacity-100'>
                    <div className='h-2 w-2 rounded-full bg-gray-300'></div>
                  </div>
                </div>
              ))}
            </div>

            {addingCategory === type && (
              <div className='mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-4 text-lg font-medium text-gray-900'>Add new category</h3>
                <div className='flex items-center gap-3'>
                  <input
                    type='text'
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder='Enter category name...'
                    className='flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(type);
                      } else if (e.key === 'Escape') {
                        handleCancel();
                      }
                    }}
                    autoFocus
                  />
                  <Button className='!py-2' onClick={() => handleSubmit(type)}>
                    Add
                  </Button>
                  <Button variant='outline' className='!py-2' onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
