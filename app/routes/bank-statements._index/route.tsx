import { json } from '@vercel/remix';
import { LoaderFunction } from '@vercel/remix';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  CalendarIcon,
  ClockIcon,
  DocumentCurrencyDollarIcon,
  FolderOpenIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { Button } from '../../components/Button';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/bank-statements`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });

  const jsonRes = await res.json();
  return json({ bankStatements: jsonRes.data });
};

export default function () {
  const { bankStatements } = useLoaderData() as any;
  const navigate = useNavigate();

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-12'>
        <h1 className='text-3xl font-light text-gray-900'>Bank Statements</h1>
        <p className='mt-2 text-gray-500'>
          No more manual data entry. Manage your transactions directly from your bank statements.
        </p>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
        {bankStatements?.length ? (
          <div className='space-y-4'>
            {bankStatements.map((bankStatement: any, index: number) => {
              return (
                <div
                  key={bankStatement._id}
                  className='group cursor-pointer rounded-xl border border-gray-100 p-6 transition-all hover:border-gray-200 hover:shadow-md'
                  onClick={() => navigate(`/bank-statements/${bankStatement._id}/transactions`)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50'>
                        <DocumentCurrencyDollarIcon className='h-6 w-6 text-purple-500' />
                      </div>
                      <div>
                        <h3 className='text-lg font-medium text-gray-900 transition-colors group-hover:text-primary'>
                          {bankStatement.title}
                        </h3>
                        <div className='mt-1 flex items-center space-x-6 text-sm text-gray-500'>
                          <div className='flex items-center space-x-2'>
                            <CalendarIcon className='h-4 w-4' />
                            <span>Created {displayDate(bankStatement.createdAt)}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <ClockIcon className='h-4 w-4' />
                            <span>{getTimeAgo(bankStatement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='text-sm text-gray-400 group-hover:text-purple-400'>→</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
              <FolderOpenIcon className='h-10 w-10 text-gray-400' />
            </div>
            <h3 className='mb-2 text-xl font-light text-gray-900'>No bank statements</h3>
            <p className='mb-8 text-gray-500'>
              Bank statements will appear here once they are uploaded.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className='hover:bg-primary-active inline-flex items-center bg-primary px-6 py-3 font-medium text-white transition-colors'
            >
              <PlusIcon className='mr-1 h-4 w-4' />
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function displayDate(date: string) {
  if (!date) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-CA', options).format(new Date(date));
}

function getTimeAgo(date: string) {
  if (!date) return '';

  const now = new Date();
  const created = new Date(date);
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}
