import { useState } from 'react';
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  ListBulletIcon,
  TagIcon,
} from '@heroicons/react/24/solid';
import { LoaderFunction, json } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { displayDate } from '../../utils/date-helpers';
import Settlements from './Settlements';
import Dropdown from '../bank-statements.$id.transactions._index/TransactionDropdown';

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

  const categoriesRes = await fetch(`${process.env.API_URL}/api/categories`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });
  const { data: categoriesData } = await categoriesRes.json();

  return json({
    group: data,
    groupTransactions,
    currentUser,
    settlements,
    categories: categoriesData,
  });
};

export default function () {
  const { group, groupTransactions, currentUser, settlements, categories } =
    useLoaderData<typeof loader>();

  const [selected, setSelected] = useState('');

  const isCurrentUser = (id: string) => currentUser._id === id;

  if (!group) {
    return <div>Group not found</div>;
  }

  const totalAmount = groupTransactions.length
    ? groupTransactions.reduce(
        (sum: number, transaction: { amount: number }) => sum + transaction.amount,
        0,
      ) / 100
    : 0;

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='mb-2 text-sm font-medium text-gray-900'>Group</div>
          {group.members?.length > 0 && (
            <div className='text-sm text-muted'>
              {group.members.length} members (
              {group.members.map((member: any, i: number) => (
                <span key={member._id}>
                  {member.name}
                  {i < group.members.length - 1 && <span className='mx-1'>·</span>}
                </span>
              ))}
              )
            </div>
          )}
        </div>
        <h1 className='text-3xl font-light text-gray-900'>{group.name}</h1>
      </div>

      <div className='mb-5 grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted'>Total Transactions</p>
              <p className='text-2xl font-bold'>{groupTransactions.length}</p>
            </div>
            <ListBulletIcon className='h-6 w-6 text-blue-600' />
          </div>
        </div>

        <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted'>Total Amount</p>
              <p className='text-2xl font-bold'>${totalAmount.toFixed(2)}</p>
            </div>
            <CurrencyDollarIcon className='h-6 w-6 text-green-600' />
          </div>
        </div>
      </div>

      {group.members.length > 1 && groupTransactions.length > 0 && (
        <div className='mb-8 rounded-xl border border-border/40 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold'>Settlements</h2>
          <Settlements
            settlements={settlements}
            members={group.members}
            currentUser={currentUser}
          />
        </div>
      )}
      <hr className='border-1 my-8 border-accent' />

      <h2 className='mb-6 text-lg font-semibold'>Transactions</h2>

      {groupTransactions?.length ? (
        <div className='space-y-4'>
          {groupTransactions.map((transaction: any) => {
            const isSelected = selected === transaction._id;
            const selectedCategory = categories.find((c: any) => c._id === transaction.category);

            return (
              <div
                key={transaction._id}
                className={`group relative rounded-xl border border-border/40 bg-white p-6 transition-all hover:border-accent/50 hover:shadow-md ${
                  isSelected ? 'border-accent shadow-md' : ''
                }`}
              >
                <div className='absolute right-4 top-4'>
                  <EllipsisVerticalIcon
                    className='hidden size-5 cursor-pointer text-muted transition-colors hover:text-primary group-hover:block'
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
                </div>

                <div className='flex flex-col gap-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-4'>
                      <div className='text-center text-accent'>
                        <div className='text-xl font-semibold'>
                          {displayDate(transaction.date)?.split(' ')[1]}
                        </div>
                        <div className='text-sm'>
                          {displayDate(transaction.date)?.split(' ')[0]}
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div className='font-medium'>
                          {transaction.subdescription.trim() || transaction.description}
                        </div>
                        {!transaction.subdescription.trim() ? null : (
                          <div className='text-sm text-muted'>{transaction.description}</div>
                        )}
                        {selectedCategory && (
                          <div className='mt-2 flex items-center gap-2'>
                            <TagIcon className='h-4 w-4 text-muted' />
                            <span className='text-sm text-muted'>{selectedCategory.name}</span>
                          </div>
                        )}
                        {transaction.note && (
                          <div className='mt-2 flex items-center gap-2 text-sm text-muted'>
                            <div className='h-1 w-1 rounded-full bg-muted' />
                            {transaction.note}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-semibold'>
                        ${Math.abs(Number(transaction.amount) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className='rounded-lg bg-gray-50 px-4 py-2'>
                    <div className='mb-1 flex items-center gap-1'>
                      <span className='text-sm font-medium'>
                        {isCurrentUser(transaction.user._id) ? 'You' : transaction.user.name} paid
                        for this transaction
                      </span>
                    </div>

                    {transaction.allocation?.members && (
                      <div className='space-y-1'>
                        {transaction.allocation.members.map((member: any) => {
                          const amountOwed = member.amount / 100;
                          if (
                            currentUser._id === transaction.user._id &&
                            member.user._id === currentUser._id
                          ) {
                            return (
                              <div
                                key={member.user._id}
                                className='flex items-center text-sm text-muted'
                              >
                                <span>You covered ${amountOwed.toFixed(2)} for yourself</span>
                              </div>
                            );
                          } else if (
                            currentUser._id !== transaction.user._id &&
                            member.user._id === transaction.user._id
                          ) {
                            return (
                              <div
                                key={member.user._id}
                                className='flex items-center text-sm text-muted'
                              >
                                <span>
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
                                  <span className='font-medium'>${amountOwed.toFixed(2)}</span>
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
          })}
        </div>
      ) : (
        <div className='rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
            <CalculatorIcon className='h-8 w-8 text-muted/60' />
          </div>
          <h3 className='text-lg font-medium'>No transactions yet</h3>
          <p className='text-sm text-muted'>
            Transactions will appear here once they are added to this group.
          </p>
        </div>
      )}
    </div>
  );
}
