import { useState } from 'react';
import { EllipsisVerticalIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { useLocation } from '@remix-run/react';

import { displayDate } from '../../utils/date-helpers';
import Dropdown from './TransactionDropdown';

type ViewTransactionCardProps = {
  transaction: any;
  groups: any[];
  bankStatementArchived: boolean;
  onTransactionSelected: (id: string) => void;
};

export default function ViewTransactionCard({
  transaction,
  groups,
  bankStatementArchived,
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
    <div key={transaction._id} className='group relative h-fit w-full border-b border-border py-6'>
      {isGrouped && !isGroupsPage && (
        <div className='absolute right-6 top-3 mt-2 inline-flex items-center rounded bg-slate-100 px-2.5 py-0.5 text-sm font-medium'>
          <UserGroupIcon className='mr-1 h-4 w-4 text-muted' />
          {group?.name}
        </div>
      )}

      <div className='relative'>
        <div className='flex items-center justify-between'>
          {!bankStatementArchived && (
            <EllipsisVerticalIcon
              onClick={handleOptionsSelected}
              className='-transform-y-1/2 invisible absolute right-0 z-10 size-6 h-full cursor-pointer text-muted hover:text-primary group-hover:visible'
            />
          )}
          {showDropdown && (
            <Dropdown
              transactionId={transaction._id}
              onClose={() => setShowDropdown(false)}
              onDeselectTransaction={() => onTransactionSelected('')}
              isGrouped={transaction.group}
            />
          )}
          <div className='flex w-full items-center gap-4'>
            <div className='text-sm text-accent'>
              <div className='text-xl font-semibold'>
                {displayDate(transaction.date)?.split(' ')[1]}
              </div>
              <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
            </div>
            <div className='flex-1'>
              <div className='font-medium'>
                {transaction.subdescription?.trim() || transaction.description}
              </div>
              {transaction.subdescription?.trim() && (
                <div className='mt-1 text-sm text-muted'>{transaction.description}</div>
              )}
            </div>
          </div>
          <div className='flex w-full items-center justify-center'>
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
