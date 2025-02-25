import { useState } from 'react';
import { ActionFunction, json } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import {
  EllipsisVerticalIcon,
  DivideIcon,
  GiftIcon,
  UserIcon,
  ChartPieIcon,
} from '@heroicons/react/24/solid';
import { z } from 'zod';
import { Button } from '../../components/Button';
import AllocationForm from './AllocationForm';
import { getUserId } from '../../utils/session.server';

enum Allocation {
  HALF = 'half',
  MINE = 'mine',
  PARTNER = 'partner',
  CUSTOM = 'custom',
}

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

  const users = await fetch(`${process.env.API_URL}/api/users`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });

  const { data: usersData } = await users.json();
  const userId = await getUserId(request);
  const usersWithoutUser = usersData.filter((u: any) => u._id.toString() !== userId?.toString());

  const { billStatement, transactions, groups } = data;

  return json({ billStatement, transactions, groups, users: usersWithoutUser });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  for (var pair of formData.entries()) {
    console.log('pair', pair[0], pair[1]);
  }

  const Schema = z.object({
    allocation: z.string(),
    kind: z.string(),
    transaction: z.string(),
    group: z.string(),
    members: z.any(),
    amount: z.number(),
  });

  const { allocation, kind, transaction, group, members, amount } = Schema.parse(
    Object.fromEntries(formData),
  );

  if (allocation === Allocation.MINE) {
    const transactionAllocation = await fetch(`${process.env.API_URL}/api/allocations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind,
        amount,
        // owner: userId,
        members,
      }),
    });

    if (transactionAllocation.statusText === 'OK') {
      const res = await fetch(`${process.env.API_URL}/api/transactions/${transaction}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, members, group }),
      });

      const { data } = await res.json();
      console.log('datal', data);
      if (res.statusText === 'OK') {
        return json({ success: true });
      } else {
        return json({ success: false });
      }
    }
  }
};

const AllocationCopy = (name?: string) => {
  return {
    OTHER_MEMBER: `Save this transaction as paid fully for ${name}`,
    MINE: 'Save this transaction as paid for you only?',
    half: `Save this transaction and split 50% 50% with ${name}`,
  };
};

export default function () {
  const [transactionIdSelected, setTransactionIdSelected] = useState('');
  const [allocationType, setAllocationType] = useState<Allocation | ''>('');
  const [allocationBase, setAllocationBase] = useState<'fixed' | 'percentage'>('fixed');
  const { billStatement, transactions, groups, users } = useLoaderData() as any;

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
            className={`group relative my-3 h-fit w-full cursor-pointer rounded bg-white px-6 py-3 ${selected ? 'border border-primary' : ''}`}
            onClick={() => handleSelected(transaction._id)}
          >
            <input hidden type='text' defaultValue={transaction._id} name='transaction' />
            <div className='flex items-center justify-between'>
              <EllipsisVerticalIcon className='-transform-y-1/2 invisible absolute right-0 size-6 h-full text-muted group-hover:visible' />
              <div className='flex w-full items-center gap-4'>
                <div className='text-sm text-[#38917D]'>
                  <div className='text-xl font-semibold'>
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
                  ${-(Number(transaction.amount) / 100)}
                </div>
              </div>
            </div>
            {transaction.type === 'Credit' && <div className='w-full' />}

            {selected && (
              <>
                <div className='border-t-secondary mt-4 flex w-full items-center gap-4 border-t py-4'>
                  <div className='flex min-w-[100px]'>
                    Allocation<span className='text-error'> *</span>
                  </div>
                  <div className='flex w-full justify-between gap-4'>
                    <div
                      className={`hover:border-accent relative flex cursor-pointer items-center justify-between gap-1 rounded-full border border-light-silver/40 px-3 py-1 ${selected && allocationType === Allocation.MINE ? 'border-accent' : ''}`}
                      onClick={() => {
                        setAllocationType(Allocation.MINE);
                      }}
                    >
                      <UserIcon className='size-3' />
                      <span>Paid for me</span>
                      <input
                        type='radio'
                        id={Allocation.MINE}
                        name='allocation'
                        value={Allocation.MINE}
                        className='absolute left-0 top-0 z-10 h-full w-full cursor-pointer opacity-0'
                      />
                    </div>
                    <div
                      className={`hover:border-accent relative flex cursor-pointer items-center justify-between gap-1 rounded-full border border-light-silver/40 px-3 py-1 ${selected && allocationType === Allocation.HALF ? 'border-accent' : ''}`}
                      onClick={() => {
                        setAllocationType(Allocation.HALF);
                      }}
                    >
                      <DivideIcon className='size-3' />
                      <span>Divided equally</span>
                      <input
                        type='radio'
                        id={Allocation.HALF}
                        name='allocation'
                        value={Allocation.HALF}
                        className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                      />
                    </div>

                    <div
                      className={`hover:border-accent relative flex cursor-pointer items-center justify-between gap-1 rounded-full border border-light-silver/40 px-3 py-1 ${selected && allocationType === Allocation.PARTNER ? 'border-accent' : ''}`}
                      onClick={() => {
                        setAllocationType(Allocation.PARTNER);
                      }}
                    >
                      <GiftIcon className='size-3' />
                      <span>Paid for partner</span>
                      <input
                        type='radio'
                        id={Allocation.PARTNER}
                        name='allocation'
                        value={Allocation.PARTNER}
                        className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                      />
                    </div>
                    <div
                      className={`hover:border-accent relative flex cursor-pointer items-center justify-between gap-1 rounded-full border border-light-silver/40 px-3 py-1 ${selected && allocationType === Allocation.MINE ? 'border-accent' : ''}`}
                      onClick={() => {
                        handleSelected(transaction._id);
                        setAllocationType(Allocation.CUSTOM);
                      }}
                    >
                      <ChartPieIcon className='size-3' />
                      <span>Custom</span>
                      <input
                        type='radio'
                        id={Allocation.CUSTOM}
                        name='allocation'
                        value={Allocation.CUSTOM}
                        className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                      />
                    </div>
                  </div>
                </div>

                {allocationType === Allocation.CUSTOM && (
                  <AllocationForm
                    allocationBase={allocationBase}
                    onAllocationBaseChange={setAllocationBase}
                    users={users}
                  />
                )}

                <div className='flex w-full items-center gap-4 py-4'>
                  <div className='min-w-[100px]'>
                    Group<span className='text-error'>*</span>
                  </div>
                  <select name='group' required className='h-10 min-w-[400px] border px-4 py-2'>
                    <option value={''} className='!text-muted'>
                      Select an option
                    </option>
                    {groups.map((group: any) => (
                      <option value={group._id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div className='flex items-center justify-end gap-2 py-4'>
                  <Button type='submit'>Save</Button>
                  <Button variant='outline' type='button'>
                    Cancel
                  </Button>
                </div>
              </>
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
