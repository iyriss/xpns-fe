import { useState, useEffect } from 'react';
import { z } from 'zod';
import { ActionFunction, json, redirect } from '@vercel/remix';
import { useLoaderData, useNavigate, useActionData, useFetcher } from '@remix-run/react';
import { toast } from 'sonner';
import { LoaderFunction } from '@vercel/remix';

import ViewTransactionCard from './ViewTransactionCard';
import { Button } from '../../components/Button';
import EditTransactionCard from './EditTransactionCard';
import {
  ArrowsRightLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';

import { MoreButton } from './MoreButton';

type ActionData = {
  success: boolean;
  data?: any;
};

export const loader: LoaderFunction = async ({ params, request, context }) => {
  const bankStatementId = params.id;
  const res = await fetch(
    `${process.env.API_URL}/api/bank-statements/${bankStatementId}/transactions`,
    {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
    },
  );
  const { data } = await res.json();
  const userId = data.transactions[0].user;

  const categoriesRes = await fetch(`${process.env.API_URL}/api/categories`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });
  const { data: categoriesData } = await categoriesRes.json();

  const { bankStatement, transactions, groups } = data;

  return json({
    bankStatement,
    transactions,
    groups,
    categories: categoriesData,
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
    category: z.string().optional(),
    note: z.string(),
  });

  const { transactionId, group, allocation, note, category } = TransactionSchema.parse(parsedData);

  if (!transactionId || !group || !allocation) {
    return json({ success: false });
  }

  const res = await fetch(`${process.env.API_URL}/api/transactions/${transactionId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
    body: JSON.stringify({ group, allocation, note, category }),
  });

  const { data } = await res.json();

  if (res.ok) {
    return { success: true, data };
  } else {
    return { success: false };
  }
};

enum TransactionDisplay {
  EDIT = 'edit',
  VIEW = 'view',
}

const collapseTsxButton = (title: string, collapsed: boolean, onClick: () => void) => (
  <div className='flex items-center justify-between'>
    <h2 className='mb-2 text-xl font-medium text-gray-900'>{title} transactions</h2>
    <Button variant='text' className='flex items-center gap-1 text-sm' onClick={onClick}>
      {collapsed ? (
        <>
          <ChevronDownIcon className='h-4 w-4' />
          Expand
        </>
      ) : (
        <>
          <ChevronUpIcon className='h-4 w-4' />
          Collapse
        </>
      )}
    </Button>
  </div>
);

export default function () {
  const [transactionIdSelected, setTransactionIdSelected] = useState('');
  const [defaultGroup, setDefaultGroup] = useState('');
  const [unallocatedTsxCollapsed, setUnallocatedTsxCollapsed] = useState(false);
  const [allocatedTsxCollapsed, setAllocatedTsxCollapsed] = useState(false);
  const [defaultTransactionDisplay, setDefaultTransactionDisplay] = useState(
    TransactionDisplay.EDIT,
  );

  const { bankStatement, transactions, groups, categories, currentUser } = useLoaderData() as any;
  const actionData = useActionData<ActionData>();
  const deleteFetcher = useFetcher();

  if (!bankStatement) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-2 text-xl font-medium text-gray-900'>Bank statement not found</h1>
          <p className='text-gray-500'>
            The bank statement may have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const allocatedTransactions = transactions.filter((t: any) => t.group);
  const unallocatedTransactions = transactions.filter((t: any) => !t.group);
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.success) {
        toast.success('Transaction saved successfully!');
        setTransactionIdSelected('');
      } else {
        toast.error('Failed to save transaction. Please try again.');
      }
    }
  }, [actionData]);

  if (deleteFetcher.data && deleteFetcher.state === 'idle') {
    const data = deleteFetcher.data as { success: boolean; error?: string };
    if (data.success) {
      return redirect('/bank-statements');
    }
  }

  function handleSelected(transaction: string) {
    setTransactionIdSelected(transaction);
  }

  function handleDefaultGroup(e: any) {
    setDefaultGroup(e.target.value);
  }

  function handleDeleteBankStatement() {
    deleteFetcher.submit(
      {},
      {
        method: 'DELETE',
        action: `/bank-statements/${bankStatement._id}`,
      },
    );
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
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-12'>
        <div className='mb-2 text-sm font-medium text-gray-900'>Bank statement</div>
        <h1 className='text-3xl font-light text-gray-900'>{bankStatement?.title}</h1>
        <div className='relative flex items-center justify-between'>
          <div className='mt-2 text-gray-500'>
            <span>{displayLongDate(dates.nearest)}</span> -{' '}
            <span>{displayLongDate(dates.furthest)}</span>
          </div>
          <MoreButton
            isIdleState={deleteFetcher.state === 'idle'}
            onDelete={handleDeleteBankStatement}
          />
        </div>
      </div>

      <div className='mb-5 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <label className='mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700'>
              <UserGroupIcon className='h-4 w-4 text-gray-500' />
              Default group
            </label>

            {groups.length > 0 ? (
              <select
                name='group'
                required
                className='w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
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
            ) : (
              <div className='flex items-center gap-1 text-sm text-gray-500'>
                No groups yet.
                <Button variant='text' className='!px-0' onClick={() => navigate('/groups')}>
                  Create one
                </Button>
                .
              </div>
            )}
          </div>

          <div>
            <label className='mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700'>
              <ArrowsRightLeftIcon className='h-4 w-4 text-gray-500' />
              Transactions display
            </label>
            <div className='flex w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white'>
              <label
                className={`flex h-12 w-full cursor-pointer items-center justify-center px-4 text-sm transition-all duration-200 ${
                  defaultTransactionDisplay === TransactionDisplay.EDIT
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
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
                <span className='font-medium'>Edit</span>
              </label>
              <label
                className={`flex h-12 w-full cursor-pointer items-center justify-center px-4 text-sm transition-all duration-200 ${
                  defaultTransactionDisplay === TransactionDisplay.VIEW
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
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
                <span className='font-medium'>View</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
        <div className='space-y-8'>
          {defaultTransactionDisplay === TransactionDisplay.EDIT ? (
            <>
              {unallocatedTransactions.length > 0 && (
                <>
                  {collapseTsxButton('Unallocated', unallocatedTsxCollapsed, () =>
                    setUnallocatedTsxCollapsed(!unallocatedTsxCollapsed),
                  )}
                  <div
                    className={`space-y-4 transition-all ${unallocatedTsxCollapsed ? 'hidden' : ''}`}
                  >
                    {unallocatedTransactions.map((transaction: any) => (
                      <EditTransactionCard
                        key={transaction._id}
                        transaction={transaction}
                        selected={transactionIdSelected === transaction._id}
                        groups={groups}
                        categories={categories}
                        defaultGroup={defaultGroup}
                        currentUser={currentUser}
                        bankStatementId={bankStatement._id}
                        onTransactionSelected={handleSelected}
                      />
                    ))}
                  </div>
                </>
              )}

              {allocatedTransactions.length > 0 && (
                <>
                  {collapseTsxButton('Allocated', allocatedTsxCollapsed, () =>
                    setAllocatedTsxCollapsed(!allocatedTsxCollapsed),
                  )}
                  <div
                    className={`space-y-4 transition-all ${allocatedTsxCollapsed ? 'hidden' : ''}`}
                  >
                    {allocatedTransactions.map((transaction: any) => (
                      <ViewTransactionCard
                        key={transaction._id}
                        transaction={transaction}
                        groups={groups}
                        onTransactionSelected={handleSelected}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {unallocatedTransactions.length > 0 && (
                <>
                  {collapseTsxButton('Unallocated', unallocatedTsxCollapsed, () =>
                    setUnallocatedTsxCollapsed(!unallocatedTsxCollapsed),
                  )}
                  <div
                    className={`space-y-4 transition-all ${unallocatedTsxCollapsed ? 'hidden' : ''}`}
                  >
                    {unallocatedTransactions.map((transaction: any) => (
                      <ViewTransactionCard
                        key={transaction._id}
                        transaction={transaction}
                        groups={groups}
                        onTransactionSelected={handleSelected}
                      />
                    ))}
                  </div>
                </>
              )}

              {allocatedTransactions.length > 0 && (
                <>
                  {collapseTsxButton('Allocated', allocatedTsxCollapsed, () =>
                    setAllocatedTsxCollapsed(!allocatedTsxCollapsed),
                  )}
                  <div
                    className={`space-y-4 transition-all ${allocatedTsxCollapsed ? 'hidden' : ''}`}
                  >
                    {allocatedTransactions.map((transaction: any) => (
                      <ViewTransactionCard
                        key={transaction._id}
                        transaction={transaction}
                        groups={groups}
                        onTransactionSelected={handleSelected}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function displayLongDate(date: string) {
  if (!date) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}
