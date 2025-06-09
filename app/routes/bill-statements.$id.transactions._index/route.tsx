import { useState } from 'react';
import { z } from 'zod';
import { ActionFunction, json } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';

import TransactionCard from './TransactionCard';
import { Button } from '../../components/Button';

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
  });

  const { transactionId, group, allocation } = TransactionSchema.parse(parsedData);

  if (!transactionId || !group || !allocation) {
    return json({ success: false });
  }

  const res = await fetch(`${process.env.API_URL}/api/transactions/${transactionId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
    body: JSON.stringify({ group, allocation }),
  });

  const { data } = await res.json();

  if (res.statusText === 'OK') {
    return json({ success: true, data });
  } else {
    return json({ success: false });
  }
};

export default function () {
  const [transactionIdSelected, setTransactionIdSelected] = useState('');
  const [defaultGroup, setDefaultGroup] = useState('');

  const { billStatement, transactions, groups, currentUser } = useLoaderData() as any;

  const allocatedTransactions = transactions.filter((t: any) => t.group);
  const unallocatedTransactions = transactions.filter((t: any) => !t.group);
  const navigate = useNavigate();

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
      <div className='flex justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>{billStatement?.title}</h1>
          <div className='mb-5 mt-1 text-muted'>
            <span>{displayLongDate(dates.nearest)}</span> -{' '}
            <span>{displayLongDate(dates.furthest)}</span>
          </div>
        </div>
        <div>
          {groups.length > 0 ? (
            <>
              <div>Default group</div>
              <div>
                <select
                  name='group'
                  required
                  className='h-10 min-w-[400px] border px-4 py-2'
                  onChange={handleDefaultGroup}
                  value={defaultGroup}
                >
                  <option value={''} className='!text-muted'>
                    Select a group
                  </option>
                  {groups.map((group: any) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <Button variant='text' onClick={() => navigate('/groups')}>
              + Create group
            </Button>
          )}
        </div>
      </div>

      {unallocatedTransactions.map((transaction: any) => {
        const selected = transaction._id === transactionIdSelected;

        return (
          <TransactionCard
            key={transaction._id}
            transaction={transaction}
            selected={selected}
            groups={groups}
            currentUser={currentUser}
            billStatementId={billStatement._id}
            defaultGroup={defaultGroup}
            onTransactionSelected={handleSelected}
          />
        );
      })}

      <div className='mt-10'>
        <h2 className='text-lg font-semibold'>Allocated transactions</h2>
      </div>
      {allocatedTransactions.map((transaction: any) => {
        const selected = transaction._id === transactionIdSelected;
        return (
          <TransactionCard
            key={transaction._id}
            transaction={transaction}
            selected={selected}
            groups={groups}
            currentUser={currentUser}
            billStatementId={billStatement._id}
            defaultGroup={defaultGroup}
            onTransactionSelected={handleSelected}
          />
        );
      })}
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
