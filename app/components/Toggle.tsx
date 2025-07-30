import { forwardRef } from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, disabled = false, label }) => {
    return (
      <div className='flex items-center gap-3'>
        <button
          type='button'
          role='switch'
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'bg-primary hover:bg-primary-active' : 'bg-gray-200 hover:bg-gray-300'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} `}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0.5'} `}
          />
        </button>

        {label && (
          <div className='flex flex-col'>
            {label && <span className='font-medium text-gray-900'>{label}</span>}
          </div>
        )}
      </div>
    );
  },
);

Toggle.displayName = 'Toggle';
