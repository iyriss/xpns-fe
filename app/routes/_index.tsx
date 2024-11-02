import { ActionFunction } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';

export default function () {
  const navigate = useNavigate();
  return (
    <div className='h-full min-h-screen w-full p-5'>
      <div className='h-full'>
        <div className='flex h-full items-center justify-center gap-12'>
          <div
            onClick={() => navigate('/upload')}
            className='flex h-40 w-full max-w-40 cursor-pointer items-center justify-center rounded-lg bg-[#3e405b] p-4 text-center text-white shadow hover:opacity-95'
          >
            Upload
          </div>
          <div
            onClick={() => navigate('/transactions')}
            className='flex h-40 w-full max-w-40 cursor-pointer items-center justify-center rounded-lg bg-[#3e405b] p-4 text-center text-white shadow hover:opacity-95'
          >
            Work on transactions
          </div>
          <div className='flex h-40 w-full max-w-40 cursor-pointer items-center justify-center rounded-lg bg-[#3e405b] p-4 text-center text-white shadow hover:opacity-95'>
            See past transactions
          </div>
        </div>
      </div>
    </div>
  );
}
