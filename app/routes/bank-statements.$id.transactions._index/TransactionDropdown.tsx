import { TrashIcon, UserMinusIcon } from '@heroicons/react/24/solid';
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';

type DropdownProps = {
  transactionId: string;
  isGrouped: boolean;
  onClose: () => void;
  onDeselectTransaction: () => void;
};

export default function Dropdown({
  transactionId,
  isGrouped,
  onClose,
  onDeselectTransaction,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if ((fetcher.data as any)?.success) {
      onDeselectTransaction();
    }
  }, [(fetcher.data as any)?.success]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    fetcher.submit(null, { method: 'delete', action: `/transactions/${transactionId}` });
  };

  const handleUngroup = (e: React.MouseEvent) => {
    e.preventDefault();
    fetcher.submit(null, { method: 'put', action: `/transactions/${transactionId}/ungroup` });
  };

  return (
    <div
      ref={dropdownRef}
      className='absolute right-2 top-3 z-10 flex min-w-[120px] flex-col rounded border border-border bg-white py-2 shadow-sm'
    >
      {isGrouped && (
        <button
          onClick={handleUngroup}
          className='flex cursor-pointer items-center px-3 py-2 text-left hover:bg-border hover:text-primary'
        >
          <UserMinusIcon className='mr-2 h-4 w-4' />
          Ungroup
        </button>
      )}
      <button
        onClick={handleDelete}
        className='flex cursor-pointer items-center px-3 py-2 text-left hover:bg-border hover:text-primary'
      >
        <TrashIcon className='mr-2 h-4 w-4' />
        Delete
      </button>
    </div>
  );
}
