import { ActionFunction } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';

export default function () {
  const navigate = useNavigate();
  return (
    <div className='h-full min-h-screen w-full p-5'>
      <div className='flex'>
        <div className='m-auto grid w-fit grid-cols-2 grid-rows-2 gap-5'>
          <div
            onClick={() => navigate('/upload')}
            className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#ec9340] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'
          >
            Upload bill statements
          </div>
          <div
            onClick={() => navigate('/transactions')}
            className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#604ab0] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'
          >
            Expense transactions
          </div>
          <div className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#38917D] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'>
            Past expenses
          </div>
          <div className='flex h-60 w-60 cursor-pointer items-center justify-center rounded-lg bg-[#403734] p-4 text-center text-2xl font-bold text-white shadow hover:opacity-95'>
            Balances
          </div>
        </div>
      </div>
    </div>
  );
}
