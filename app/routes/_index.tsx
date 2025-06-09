import { ActionFunction } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';

export default function () {
  const navigate = useNavigate();

  return (
    <div className='m-auto -mt-20 flex h-full items-center gap-5'>
      <div
        onClick={() => navigate('/upload')}
        className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#ec9340] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'
      >
        Upload bill statements
      </div>
      <div
        onClick={() => navigate('/bill-statements')}
        className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#604ab0] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'
      >
        Uncaptured expenses
      </div>
      <div
        onClick={() => navigate('/groups')}
        className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#38917D] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'
      >
        Groups and settlements
      </div>
    </div>
  );
}
