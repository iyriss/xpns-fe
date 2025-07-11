import { useEffect, useState } from 'react';

const COLUMN_OPTIONS = [
  { value: 'date', label: 'Date', description: 'Transaction date' },
  { value: 'description', label: 'Description', description: 'Transaction description' },
  { value: 'subdescription', label: 'Subdescription', description: 'Transaction subdescription' },
  { value: 'amount', label: 'Amount', description: 'Transaction amount' },
  { value: 'debit', label: 'Debit', description: 'Money going out' },
  { value: 'credit', label: 'Credit', description: 'Money coming in' },
  { value: 'type', label: 'Type', description: 'Transaction type' },
  { value: 'balance', label: 'Balance', description: 'Account balance' },
  { value: 'other', label: 'Ignore', description: 'Skip this column' },
];

export const ColumnTypeSelector = ({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = COLUMN_OPTIONS.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.column-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className='column-selector relative'>
      <button
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-all ${
          disabled
            ? 'cursor-not-allowed bg-gray-50 text-gray-400'
            : 'cursor-pointer bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500'
        } `}
      >
        <span className='font-medium'>{selectedOption?.label || 'Select type'}</span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className='absolute z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg'>
          <div className='py-1'>
            {COLUMN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                  value === option.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                } `}
              >
                <div className='font-medium'>{option.label}</div>
                <div className='text-xs text-gray-500'>{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
