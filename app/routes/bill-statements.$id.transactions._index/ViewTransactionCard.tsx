import { useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { useLocation } from '@remix-run/react';

import { displayDate } from '../../utils/date-helpers';
import Dropdown from './TransactionDropdown';

type ViewTransactionCardProps = {
  transaction: any;
  groups: any[];
  onTransactionSelected: (id: string) => void;
};

export default function ViewTransactionCard({
  transaction,
  groups,
  onTransactionSelected,
}: ViewTransactionCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const isGroupsPage = useLocation().pathname.includes('groups');
  const isCredit = transaction.type === 'Credit';
  const isGrouped = transaction.group;

  function handleOptionsSelected(e: any) {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  }

  const group = groups.find((g) => g._id === transaction.group);

  return (
    <div
      key={transaction._id}
      className={`group relative h-fit w-full border-b border-border py-6 ${
        isGrouped && !isGroupsPage ? 'bg-mist/40' : ''
      }`}
    >
      {isGrouped && !isGroupsPage && (
        <div className='absolute right-6 top-3 mt-2 inline-flex items-center rounded bg-slate-200 px-2.5 py-0.5 text-sm font-medium'>
          <svg
            className='mr-1 h-4 w-4 text-muted'
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
          </svg>{' '}
          {group?.name}
        </div>
      )}

      <div className='relative'>
        <div className='flex items-center justify-between'>
          <EllipsisVerticalIcon
            onClick={handleOptionsSelected}
            className='-transform-y-1/2 invisible absolute right-0 z-10 size-6 h-full cursor-pointer text-muted hover:text-primary group-hover:visible'
          />
          {showDropdown && (
            <Dropdown
              transactionId={transaction._id}
              onClose={() => setShowDropdown(false)}
              onDeselectTransaction={() => onTransactionSelected('')}
              isGrouped={transaction.group}
            />
          )}
          <div
            className={`flex w-full items-center gap-4 ${isGrouped && !isGroupsPage ? 'opacity-50' : ''}`}
          >
            <div className='text-sm text-accent'>
              <div className='text-xl font-semibold'>
                {displayDate(transaction.date)?.split(' ')[1]}
              </div>
              <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
            </div>
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                {transaction.subdescription.trim() || transaction.description}
              </div>
              {transaction.subdescription.trim() && (
                <div className='mt-1 text-sm text-muted'>{transaction.description}</div>
              )}
            </div>
          </div>
          <div
            className={`flex w-full items-center justify-center ${isGrouped && !isGroupsPage ? 'opacity-50' : ''}`}
          >
            <div className='text-center'>
              <div className='flex items-center gap-2'>
                <div className='mr-4 text-sm font-medium text-muted'>
                  {isCredit ? 'Credit' : 'Debit'}
                </div>
                <div className={`${isCredit ? 'text-green-700' : 'text-red-600'}`}>
                  ${(Number(transaction.amount) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
