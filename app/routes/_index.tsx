import {
  DocumentCheckIcon,
  DocumentCurrencyDollarIcon,
  PlusIcon,
  TagIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from '@remix-run/react';

export default function () {
  const navigate = useNavigate();

  return (
    <div className='mx-auto mt-10 h-fit max-w-7xl rounded-3xl border border-border/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl md:flex md:flex-col md:justify-between'>
      <div className='mb-5 flex flex-col items-center gap-5 md:flex-row'>
        <div className='mb-auto text-center text-4xl font-bold !leading-tight md:w-1/3 md:text-left md:text-5xl'>
          Manage your monthly expenses.
        </div>
        <div
          onClick={() => navigate('/upload')}
          className='flex h-60 w-60 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary p-4 text-center text-2xl text-muted shadow hover:border-solid hover:text-primary hover:opacity-95 md:ml-auto'
        >
          <PlusIcon className='mb-5 h-8 w-8 text-primary' />
          <span className='text-sm'>Upload bill statement</span>
        </div>
      </div>

      <div className='mt-auto flex flex-col justify-between gap-6 md:flex-row'>
        <div
          onClick={() => navigate('/bill-statements')}
          className='flex h-60 cursor-pointer items-center justify-center rounded-3xl bg-[#0a54cd] p-8 text-center text-2xl text-white shadow hover:opacity-90 md:w-1/2'
        >
          <DocumentCurrencyDollarIcon className='mr-2 h-6 w-6' />
          Uncaptured expenses
        </div>

        <div
          onClick={() => navigate('/categories')}
          className='flex h-60 cursor-pointer items-center justify-center rounded-3xl bg-[#058a80] p-8 text-center text-2xl text-white shadow hover:opacity-90 md:w-1/2'
        >
          <TagIcon className='mr-2 h-6 w-6' />
          Categories
        </div>

        <div
          onClick={() => navigate('/groups')}
          className='flex h-60 cursor-pointer items-center justify-center rounded-3xl bg-[#d38822] p-8 text-center text-2xl text-white shadow hover:opacity-90 md:w-1/2'
        >
          <DocumentCheckIcon className='mr-2 h-6 w-6' />
          Groups and settlements
        </div>
      </div>
    </div>
  );
}
