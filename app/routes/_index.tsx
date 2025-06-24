import { PlusIcon } from '@heroicons/react/24/solid';
import { useNavigate } from '@remix-run/react';

export default function () {
  const navigate = useNavigate();

  return (
    <div className='m-auto mt-10 h-full rounded-xl bg-white px-12 py-10 md:flex md:flex-col md:justify-between'>
      <div className='flex flex-col items-center gap-5 md:flex-row'>
        <div className='mb-auto text-center text-4xl font-bold md:w-1/3 md:text-left md:text-5xl'>
          Manage your expenses
        </div>
        <div
          onClick={() => navigate('/upload')}
          className='mb-5 flex h-60 w-60 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary p-4 text-center text-2xl text-muted shadow hover:border-solid hover:text-primary hover:opacity-95 md:ml-auto'
        >
          <PlusIcon className='mb-5 h-8 w-8 text-primary' />
          <span className='text-sm'>Upload bill statement</span>
        </div>
      </div>

      <div className='mt-auto flex flex-col justify-between gap-6 md:flex-row'>
        <div
          onClick={() => navigate('/bill-statements')}
          className='flex h-60 cursor-pointer items-center justify-center rounded-3xl bg-[#3b875b] p-8 text-center text-2xl text-white shadow hover:opacity-90 md:w-1/2'
        >
          Uncaptured expenses
        </div>
        <div
          onClick={() => navigate('/groups')}
          className='flex h-60 cursor-pointer items-center justify-center rounded-3xl bg-[#058a80] p-8 text-center text-2xl text-white shadow hover:opacity-90 md:w-1/2'
        >
          Groups and settlements
        </div>
      </div>
    </div>
  );
}
