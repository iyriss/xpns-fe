import { json } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  EllipsisVerticalIcon,
  DivideIcon,
  GiftIcon,
  UserIcon,
  ChartPieIcon,
} from '@heroicons/react/24/solid';

export const loader: LoaderFunction = async ({ params, request, context }) => {
  const billStatementId = params.id;
  const res = await fetch(
    `http://localhost:5000/api/bill-statements/${billStatementId}/transactions`,
  );
  const data = await res.json();
  console.log('Data', data);
  return json({ billStatement: data.billStatement, transactions: data.transactions });
};

export default function () {
  const { billStatement, transactions } = useLoaderData() as any;
  console.log({ billStatement, transactions });

  return (
    <div className='mx-auto w-full max-w-[1020px] rounded p-5'>
      <h1 className='my-4 text-2xl font-semibold'>{billStatement.title}</h1>
      {transactions.map((transaction: any) => (
        <div
          key={transaction._id}
          className='group relative my-3 flex w-full cursor-pointer items-center justify-between rounded bg-white px-6 py-3'
        >
          <EllipsisVerticalIcon className='-transform-y-1/2 invisible absolute right-0 size-6 text-muted hover:text-[#604ab0] group-hover:visible' />

          <div className='flex w-full items-center gap-4'>
            <div className='text-sm text-[#38917D] text-muted'>
              <div className='text-medium text-xl'>
                {displayDate(transaction.date)?.split(' ')[1]}
              </div>
              <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
            </div>
            <div>{transaction.subdescription.trim() || transaction.description}</div>
          </div>
          <div className='flex w-full items-center justify-center'>
            <div className='text-center'>
              <span className='mr-4 font-semibold'>
                {transaction.type === 'Credit' ? 'Deposit' : 'Paid'}
              </span>
              ${Number(transaction.amount) / 100}
            </div>
          </div>
          {transaction.type === 'Credit' ? (
            <div className='w-full' />
          ) : (
            <div className='flex w-full justify-center gap-4 pr-2 text-xs text-muted'>
              <div className='flex flex-col items-center justify-between hover:text-[#604ab0]'>
                <UserIcon className='size-4' />
                Just me
              </div>
              <div className='flex flex-col items-center justify-between hover:text-[#604ab0]'>
                <DivideIcon className='size-4' />
                Half
              </div>
              <div className='flex flex-col items-center justify-between hover:text-[#604ab0]'>
                <GiftIcon className='size-4' />
                Just other
              </div>
              <div className='flex flex-col items-center justify-between hover:text-[#604ab0]'>
                <ChartPieIcon className='size-4' />
                Custom
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function displayDate(date: string) {
  if (!date) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-CA', options).format(new Date(date));
}
