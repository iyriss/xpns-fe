import { useState, useEffect } from 'react';
import { z } from 'zod';
import { ActionFunction, json } from '@vercel/remix';
import { useLoaderData, useNavigate, useActionData } from '@remix-run/react';
import { toast } from 'sonner';
import { LoaderFunction } from '@vercel/remix';

import ViewTransactionCard from './ViewTransactionCard';
import { Button } from '../../components/Button';
import EditTransactionCard from './EditTransactionCard';

type ActionData = {
  success: boolean;
  data?: any;
};

export const loader: LoaderFunction = async ({ params, request, context }) => {
  const billStatementId = params.id;
  const res = await fetch(
    `${process.env.API_URL}/api/bill-statements/${billStatementId}/transactions`,
    {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
    },
  );
  const { data } = await res.json();
  const userId = data.transactions[0].user;

  const { billStatement, transactions, groups } = data;

  return json({
    billStatement,
    transactions,
    groups,
    currentUser: userId,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parsedData = JSON.parse(formData.get('data') as string);

  const TransactionSchema = z.object({
    transactionId: z.string(),
    group: z.string(),
    allocation: z.object({
      method: z.enum(['percentage', 'fixed']),
      members: z.array(
        z.object({
          user: z.string(),
          portion: z.number(),
          amount: z.number(),
        }),
      ),
    }),
    note: z.string(),
  });

  const { transactionId, group, allocation, note } = TransactionSchema.parse(parsedData);

  if (!transactionId || !group || !allocation) {
    return json({ success: false });
  }

  const res = await fetch(`${process.env.API_URL}/api/transactions/${transactionId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
    body: JSON.stringify({ group, allocation, note }),
  });

  const { data } = await res.json();

  if (res.statusText === 'OK') {
    return json({ success: true, data });
  } else {
    return json({ success: false });
  }
};

enum TransactionDisplay {
  EDIT = 'edit',
  VIEW = 'view',
}

export default function () {
  const [transactionIdSelected, setTransactionIdSelected] = useState('');
  const [defaultGroup, setDefaultGroup] = useState('');
  const [defaultTransactionDisplay, setDefaultTransactionDisplay] = useState(
    TransactionDisplay.EDIT,
  );

  const { billStatement, transactions, groups, currentUser } = useLoaderData() as any;
  const actionData = useActionData<ActionData>();

  const allocatedTransactions = transactions.filter((t: any) => t.group);
  const unallocatedTransactions = transactions.filter((t: any) => !t.group);
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success('Transaction saved successfully!');
        setTransactionIdSelected('');
      } else {
        toast.error('Failed to save transaction. Please try again.');
      }
    }
  }, [actionData]);

  function handleSelected(transaction: string) {
    setTransactionIdSelected(transaction);
  }

  function handleDefaultGroup(e: any) {
    setDefaultGroup(e.target.value);
  }

  const dates = transactions.reduce(
    (acc: any, transaction: any) => {
      if (acc.nearest < transaction?.date) {
        acc.nearest = transaction?.date;
      }
      if (acc.furthest > transaction?.date) {
        acc.furthest = transaction?.date;
      }
      return acc;
    },
    { nearest: transactions[0]?.date, furthest: transactions[0]?.date },
  );

  return (
    <div className='mx-auto mb-10 w-full max-w-[1020px] rounded-xl bg-white p-12'>
      <div className='text-sm font-semibold text-accent'>Bill statement</div>
      <h1 className='text-2xl font-semibold'>{billStatement?.title}</h1>
      <div className='mb-5 mt-1 text-muted'>
        <span>{displayLongDate(dates.nearest)}</span> -{' '}
        <span>{displayLongDate(dates.furthest)}</span>
      </div>

      <div className='mb-8 overflow-hidden border-b border-accent/40 pb-8'>
        <div className='flex items-start justify-between gap-8'>
          {groups.length > 0 ? (
            <div className='flex-1'>
              <label className='mb-1 block flex items-center gap-2 text-sm font-medium'>
                <svg
                  className='h-4 w-4 text-blue-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                Default group
              </label>
              <select
                name='group'
                required
                className='h-10 w-full cursor-pointer rounded-md border border-border bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm transition-all hover:border-gray-400'
                onChange={handleDefaultGroup}
                value={defaultGroup}
              >
                <option value={''} className='text-gray-500'>
                  Select a group
                </option>
                {groups.map((group: any) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className='flex-1'>
              <label className='mb-1 block flex items-center gap-2 text-sm font-medium'>
                <svg
                  className='h-4 w-4 text-green-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                Groups
              </label>
              <Button
                variant='text'
                onClick={() => navigate('/groups')}
                className='h-11 rounded-md px-6 text-sm text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
              >
                + Create group
              </Button>
            </div>
          )}

          <div className='flex-1'>
            <label className='mb-1 block flex items-center gap-2 text-sm font-medium'>
              <svg
                className='h-4 w-4 text-purple-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 10h16M4 14h16M4 18h16'
                />
              </svg>
              Transactions display
            </label>
            <div className='flex w-full items-center overflow-hidden rounded-md border border-border bg-white/80 shadow-sm backdrop-blur-sm'>
              <label
                className={`flex-1 cursor-pointer px-4 py-3 text-center text-sm transition-all duration-200 ${
                  defaultTransactionDisplay === TransactionDisplay.EDIT
                    ? 'bg-accent text-white shadow-md'
                    : 'hover:bg-mist text-gray-600 hover:text-gray-800'
                }`}
              >
                <input
                  type='radio'
                  name='transactionDisplay'
                  value='edit'
                  checked={defaultTransactionDisplay === TransactionDisplay.EDIT}
                  onChange={() => setDefaultTransactionDisplay(TransactionDisplay.EDIT)}
                  className='sr-only'
                />
                <span>Edit</span>
              </label>
              <label
                className={`flex-1 cursor-pointer px-4 py-3 text-center text-sm transition-all duration-200 ${
                  defaultTransactionDisplay === TransactionDisplay.VIEW
                    ? 'bg-accent text-white shadow-md'
                    : 'hover:bg-mist text-gray-600 hover:text-gray-800'
                }`}
              >
                <input
                  type='radio'
                  name='transactionDisplay'
                  value='view'
                  checked={defaultTransactionDisplay === TransactionDisplay.VIEW}
                  onChange={() => setDefaultTransactionDisplay(TransactionDisplay.VIEW)}
                  className='sr-only'
                />
                <span>View</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-10 text-sm font-semibold uppercase tracking-wide text-gray-600'>
        Unallocated transactions
      </div>
      {unallocatedTransactions.map((transaction: any) => {
        const selected = transaction._id === transactionIdSelected;

        return defaultTransactionDisplay === TransactionDisplay.EDIT ? (
          <EditTransactionCard
            key={transaction._id}
            transaction={transaction}
            selected={selected}
            groups={groups}
            currentUser={currentUser}
            billStatementId={billStatement._id}
            defaultGroup={defaultGroup}
            onTransactionSelected={handleSelected}
          />
        ) : (
          <ViewTransactionCard
            key={transaction._id}
            transaction={transaction}
            groups={groups}
            onTransactionSelected={handleSelected}
          />
        );
      })}

      {!!allocatedTransactions.length && (
        <>
          <div className='mt-10'>
            <div className='text-sm font-semibold uppercase tracking-wide text-gray-600'>
              Allocated transactions
            </div>
          </div>
          {allocatedTransactions.map((transaction: any) => {
            const selected = transaction._id === transactionIdSelected;
            return (
              <ViewTransactionCard
                key={transaction._id}
                transaction={transaction}
                groups={groups}
                onTransactionSelected={handleSelected}
              />
            );
          })}
        </>
      )}
    </div>
  );
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
