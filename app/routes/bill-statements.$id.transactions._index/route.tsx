import { ActionFunction, json } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';
import {
  EllipsisVerticalIcon,
  DivideIcon,
  GiftIcon,
  UserIcon,
  ChartPieIcon,
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import { Button } from '../../components/Button';

export const loader: LoaderFunction = async ({ params, request, context }) => {
  const billStatementId = params.id;
  const res = await fetch(
    `http://localhost:5000/api/bill-statements/${billStatementId}/transactions`,
  );
  const data = await res.json();
  return json({ billStatement: data.billStatement, transactions: data.transactions });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  for (var pair of formData.entries()) {
    console.log('pair', pair[0], pair[1]);
  }
  // TODO: next: store in databse as split
  return null;
};

enum TransactionSplit {
  JUST_OTHER = 'just_other',
  HALF = 'half',
  JUST_ME = 'just_me',
}

const transactionSplitCopy = (name?: string) => {
  return {
    just_other: `Save this transaction as paid fully for ${name}`,
    just_me: 'Save this transaction as paid for you only?',
    half: `Save this transaction and split 50% 50% with ${name}`,
  };
};
export default function () {
  const [transactionIdSelected, setTransactionIdSelected] = useState('');
  const [splitType, setSplitType] = useState<TransactionSplit | ''>('');
  const { billStatement, transactions } = useLoaderData() as any;
  console.log({ billStatement, transactions });

  function handleSelected(transaction: string) {
    setTransactionIdSelected(transaction);
  }

  const dates = transactions.reduce(
    (acc: any, transaction: any) => {
      if (acc.nearest < transaction.date) {
        acc.nearest = transaction.date;
      }
      if (acc.furthest > transaction.date) {
        acc.furthest = transaction.date;
      }
      return acc;
    },
    { nearest: transactions[0].date, furthest: transactions[0].date },
  );
  console.log('transaction', transactions);
  return (
    <div className='mx-auto w-full max-w-[1020px] rounded p-5'>
      <h1 className='mt-4 text-2xl font-semibold'>{billStatement.title}</h1>
      <div className='mb-5 mt-1 text-muted'>
        <span>{displayLongDate(dates.nearest)}</span> -{' '}
        <span>{displayLongDate(dates.furthest)}</span>
      </div>
      {transactions.map((transaction: any) => {
        const selected = transaction._id === transactionIdSelected;
        return (
          <Form
            method='POST'
            key={transaction._id}
            className='group relative my-3 h-fit w-full cursor-pointer rounded bg-white px-6 py-3'
          >
            <input hidden type='text' defaultValue={transaction._id} name='transaction' />
            <div className='flex items-center justify-between'>
              <EllipsisVerticalIcon className='-transform-y-1/2 invisible absolute right-0 size-6 h-full text-muted hover:text-[#604ab0] group-hover:visible' />
              <div className='flex w-full items-center gap-4'>
                <div className='text-sm text-[#38917D]'>
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
                  <div
                    className={`relative flex cursor-pointer flex-col items-center justify-between ${selected && splitType === TransactionSplit.JUST_ME ? 'text-[#604ab0]' : ''} hover:text-[#604ab0]`}
                    onClick={() => {
                      handleSelected(transaction._id);
                      setSplitType(TransactionSplit.JUST_ME);
                    }}
                  >
                    <UserIcon className='size-4' />
                    Just me
                    <input
                      type='radio'
                      id={TransactionSplit.JUST_ME}
                      name='split'
                      value={TransactionSplit.JUST_ME}
                      className='absolute left-0 top-0 z-10 h-full w-full cursor-pointer opacity-0'
                    />
                  </div>
                  <div
                    className={`relative flex cursor-pointer flex-col items-center justify-between ${selected && splitType === TransactionSplit.HALF ? 'text-[#604ab0]' : ''} hover:text-[#604ab0]`}
                    onClick={() => {
                      handleSelected(transaction._id);
                      setSplitType(TransactionSplit.HALF);
                    }}
                  >
                    <DivideIcon className='size-4' />
                    Half
                    <input
                      type='radio'
                      id={TransactionSplit.HALF}
                      name='split'
                      value={TransactionSplit.HALF}
                      className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                    />
                  </div>
                  <div
                    className={`relative flex cursor-pointer flex-col items-center justify-between ${selected && splitType === TransactionSplit.JUST_OTHER ? 'text-[#604ab0]' : ''} hover:text-[#604ab0]`}
                    onClick={() => {
                      handleSelected(transaction._id);
                      setSplitType(TransactionSplit.JUST_OTHER);
                    }}
                  >
                    <GiftIcon className='size-4' />
                    Just other
                    <input
                      type='radio'
                      id={TransactionSplit.JUST_OTHER}
                      name='split'
                      value={TransactionSplit.JUST_OTHER}
                      className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                    />
                  </div>
                  <div className='flex flex-col items-center justify-between hover:text-[#604ab0]'>
                    <ChartPieIcon className='size-4' />
                    Custom
                  </div>
                </div>
              )}
            </div>
            {selected && (
              <div className='mt-4 flex items-center justify-end gap-2'>
                <div className='mr-4'>{splitType && transactionSplitCopy('Dilly')[splitType]}?</div>
                <Button type='submit'>Save</Button>
                <Button variant='outline' type='button'>
                  Cancel
                </Button>
              </div>
            )}
          </Form>
        );
      })}
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

function displayLongDate(date: string) {
  if (!date) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-CA', options).format(new Date(date));
}
