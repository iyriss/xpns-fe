import {
  ArchiveBoxArrowDownIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { DeleteBankStatementModal } from './DeleteBankStatementModal';
import { useEffect, useRef } from 'react';
import { useState } from 'react';

type MoreButtonProps = {
  isIdleState: boolean;
  onDelete: () => void;
};

export const MoreButton = ({ isIdleState, onDelete }: MoreButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen]);

  return (
    <>
      <EllipsisHorizontalIcon
        className='h-6 w-6 cursor-pointer text-gray-500 hover:text-primary'
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      />

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className='absolute right-2 top-3 z-10 flex min-w-[120px] flex-col rounded border border-border bg-white py-2 shadow-sm'
        >
          <button
            // onClick={handleUngroup}
            className='flex cursor-pointer items-center px-3 py-2 text-left text-muted hover:bg-border hover:text-primary'
          >
            <ArchiveBoxArrowDownIcon className='mr-2 h-4 w-4' />
            Archive
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className='flex cursor-pointer items-center px-3 py-2 text-left text-muted hover:bg-border hover:text-primary'
          >
            <TrashIcon className='mr-2 h-4 w-4' />
            Delete
          </button>
        </div>
      )}

      <DeleteBankStatementModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (isIdleState) {
            setIsDeleteModalOpen(false);
          }
        }}
        onDelete={onDelete}
        isLoading={!isIdleState}
      />
    </>
  );
};
