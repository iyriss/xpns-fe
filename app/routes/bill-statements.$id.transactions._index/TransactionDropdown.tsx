import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';

type DropdownProps = {
  transactionId: string;
  onClose: () => void;
};

export default function Dropdown({ transactionId, onClose }: DropdownProps) {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    fetcher.submit(null, { method: 'delete', action: `/transactions/${transactionId}` });
  };

  return (
    <div
      ref={dropdownRef}
      className='absolute right-2 top-10 z-10 rounded border border-border bg-white py-2 shadow-sm'
    >
      <button
        type='submit'
        onClick={handleDelete}
        className='cursor-pointer px-3 py-1 hover:bg-border hover:text-primary'
      >
        Delete
      </button>
    </div>
  );
}
