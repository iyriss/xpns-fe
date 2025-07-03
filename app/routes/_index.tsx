import {
  DocumentCurrencyDollarIcon,
  PlusIcon,
  TagIcon,
  ArrowRightIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from '@remix-run/react';
import { Button } from '../components/Button';

export default function () {
  const navigate = useNavigate();

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-12'>
        <h1 className='text-3xl font-light text-gray-900'>Dashboard</h1>
      </div>

      {/* <div className='mb-12 grid grid-cols-1 gap-8 sm:grid-cols-3'>
        <div className='text-center'>
          <div className='mb-2 text-4xl font-light text-primary'>12</div>
          <div className='text-sm text-gray-500'>Pending Bills</div>
        </div>
        <div className='text-center'>
          <div className='mb-2 text-4xl font-light text-emerald-600'>$2,450</div>
          <div className='text-sm text-gray-500'>This Month</div>
        </div>
        <div className='text-center'>
          <div className='mb-2 text-4xl font-light text-blue-600'>3</div>
          <div className='text-sm text-gray-500'>Active Groups</div>
        </div>
      </div> */}

      <div className='mb-12'>
        <div className='rounded-2xl border border-gray-100 bg-white p-12 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div className='max-w-md'>
              <h2 className='mb-4 text-2xl font-light text-gray-900'>Get started</h2>
              <p className='mb-8 text-gray-600'>
                Upload a bill statement to begin tracking expenses.
              </p>
              <Button onClick={() => navigate('/upload')}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Upload Statement
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <button
          onClick={() => navigate('/bill-statements')}
          className='group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md'
        >
          <div className='flex items-center'>
            <DocumentCurrencyDollarIcon className='mr-4 h-6 w-6 text-purple-500' />
            <span className='font-medium text-gray-900'>View Bills</span>
          </div>
          <ArrowRightIcon className='h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-1' />
        </button>

        <button
          onClick={() => navigate('/categories')}
          className='group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md'
        >
          <div className='flex items-center'>
            <TagIcon className='mr-4 h-6 w-6 text-emerald-500' />
            <span className='font-medium text-gray-900'>Categories</span>
          </div>
          <ArrowRightIcon className='h-4 w-4 text-emerald-400 transition-transform group-hover:translate-x-1' />
        </button>

        <button
          onClick={() => navigate('/groups')}
          className='group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md'
        >
          <div className='flex items-center'>
            <UserGroupIcon className='mr-4 h-6 w-6 text-blue-500' />
            <span className='font-medium text-gray-900'>Groups</span>
          </div>
          <ArrowRightIcon className='h-4 w-4 text-blue-400 transition-transform group-hover:translate-x-1' />
        </button>
      </div>
    </div>
  );
}
