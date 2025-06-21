import { useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { LoaderFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { displayDate } from '../../utils/date-helpers';
import Settlements from './Settlements';
import Dropdown from '../bill-statements.$id.transactions._index/TransactionDropdown';

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const res = await fetch(`${process.env.API_URL}/api/groups/${params.id}`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });
  const { data } = await res.json();

  const groupRes = await fetch(`${process.env.API_URL}/api/transactions/group/${params.id}`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });
  const {
    data: { groupTransactions, settlements },
  } = await groupRes.json();

  const currentUserRes = await fetch(`${process.env.API_URL}/api/auth/me`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });

  const currentUser = await currentUserRes.json();

  return json({ group: data, groupTransactions, currentUser, settlements });
};

export default function () {
  const { group, groupTransactions, currentUser, settlements } = useLoaderData<typeof loader>();

  const [selected, setSelected] = useState('');

  const isCurrentUser = (id: string) => currentUser._id === id;

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div className='mx-auto mb-10 w-full max-w-[1020px] rounded p-5'>
      <div className='flex items-center justify-between'>
        <h1 className='my-4 text-2xl font-semibold'>{group.name} group transactions</h1>
        <div className='group relative text-base text-muted'>
          <span className='cursor-pointer'>{group.members.length} members</span>
          {group.members?.length > 0 && (
            <div className='invisible absolute -left-2 top-full z-10 mt-1 w-max rounded bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100'>
              {group.members.map((member: any) => (
                <div key={member._id} className='my-2 min-w-16'>
                  <span className='mr-2 inline-block h-1 w-1 rounded-full bg-current align-middle' />
                  {member.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='mt-3 flex items-center justify-between'>
        <div>Transactions sum:</div>
        <div>
          ${' '}
          {groupTransactions.length
            ? (
                groupTransactions.reduce(
                  (sum: number, transaction: { amount: number }) => sum + transaction.amount,
                  0,
                ) / 100
              ).toFixed(2)
            : 0}
        </div>
      </div>

      {group.members.length > 2 && (
        <div className='py-3'>
          <Settlements
            settlements={settlements}
            members={group.members}
            currentUser={currentUser}
          />
        </div>
      )}

      {groupTransactions?.length ? (
        groupTransactions.map((transaction: any) => {
          const isSelected = selected === transaction._id;

          return (
            <div
              key={transaction._id}
              className={`group relative my-3 h-fit w-full rounded bg-white px-8 py-5`}
            >
              <div className='absolute inset-0 hidden rounded border border-dashed border-accent group-hover:block' />
              <EllipsisVerticalIcon
                className='absolute right-1 top-6 hidden size-6 cursor-pointer hover:text-primary group-hover:block'
                onClick={() => setSelected(transaction._id)}
              />
              {isSelected && (
                <Dropdown
                  transactionId={transaction._id}
                  isGrouped={true}
                  onClose={() => setSelected('')}
                  onDeselectTransaction={() => setSelected('')}
                />
              )}
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <div className='flex w-full items-center gap-4'>
                    <div className='text-sm text-accent'>
                      <div className='text-xl font-semibold'>
                        {displayDate(transaction.date)?.split(' ')[1]}
                      </div>
                      <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
                    </div>
                    <div className='font-medium'>
                      {transaction.subdescription.trim() || transaction.description}
                      {!transaction.subdescription.trim() ? null : (
                        <div className='text-sm text-muted'>{transaction.description}</div>
                      )}
                      {transaction.note ? (
                        <div className='rounded bg-yellow-500/20 px-2 py-1 text-sm'>
                          {transaction.note}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className='text-lg font-semibold'>
                    ${Math.abs(Number(transaction.amount) / 100).toFixed(2)}
                  </div>
                </div>

                <div className='border-t pt-2'>
                  <div className='flex items-center gap-1 text-sm'>
                    <span className='font-medium text-emerald-600'>
                      {isCurrentUser(transaction.user._id) ? 'You' : transaction.user.name}
                    </span>
                    <span>paid for this transaction</span>
                  </div>

                  {transaction.allocation?.members && (
                    <div className='mt-2 space-y-1'>
                      {transaction.allocation.members.map((member: any) => {
                        const amountOwed = member.amount / 100;
                        if (
                          currentUser._id === transaction.user._id &&
                          member.user._id === currentUser._id
                        ) {
                          return (
                            <div key={member.user._id} className='flex items-center text-sm'>
                              <span className='text-muted'>
                                You covered ${amountOwed.toFixed(2)} for yourself
                              </span>
                            </div>
                          );
                        } else if (
                          currentUser._id !== transaction.user._id &&
                          member.user._id === transaction.user._id
                        ) {
                          return (
                            <div key={member.user._id} className='flex items-center text-sm'>
                              <span className='text-muted'>
                                {transaction.user.name} covered ${amountOwed.toFixed(2)} for them
                              </span>
                            </div>
                          );
                        } else {
                          const payer = isCurrentUser(member.user._id) ? 'You' : member.user.name;
                          const payee = isCurrentUser(transaction.user._id)
                            ? 'you'
                            : transaction.user.name;

                          const getTextColorClass = () => {
                            if (payer === 'You') return 'text-red-600';
                            if (payee === 'you') return 'text-green-600';
                            return 'text-muted';
                          };

                          const getActionText = () => {
                            if (isCurrentUser(transaction.user._id))
                              return `You lent ${member.user.name}`;
                            if (isCurrentUser(member.user._id))
                              return `You borrowed from ${transaction.user.name}`;
                            return `${member.user.name} borrowed from ${transaction.user.name}`;
                          };

                          return (
                            <div key={member.user._id} className='flex items-center text-sm'>
                              <div className={`flex items-center gap-1 ${getTextColorClass()}`}>
                                <span>{getActionText()}</span>
                                <span>${amountOwed.toFixed(2)}</span>
                                {transaction.allocation.method === 'percentage' && (
                                  <span className='text-muted'>({member.portion}%)</span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className='py-4 text-muted'>No transactions.</div>
      )}
    </div>
  );
}
