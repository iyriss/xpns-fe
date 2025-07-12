import { useState } from 'react';
import {
  validateMapping,
  transformAndValidateTransactions,
} from '../../../utils/validation-helpers';
import { Button } from '../../../../../components/Button';
import { XMarkIcon } from '@heroicons/react/24/solid';

export const SubmitStep = ({
  bankStatement,
  rows,
  mapping,
  headers,
  onBack,
  validationMessage,
}: {
  bankStatement: string;
  rows: any[];
  mapping: Record<string, string>;
  headers: string[];
  onBack: () => void;
  validationMessage?: string | null;
}) => {
  const [isValidationMessageDismissed, setIsValidationMessageDismissed] = useState(false);
  const validation = validateMapping(mapping);
  const { transactions, errors, warnings } = transformAndValidateTransactions(rows, mapping);
  const isFullyValid = validation.isValid && errors.length === 0;

  const handleDismissValidation = () => setIsValidationMessageDismissed(true);

  return (
    <div className='text-center'>
      <div className='mb-6'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
          <svg
            className='h-8 w-8 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <h3 className='mt-4 text-lg font-medium text-gray-900'>Ready to upload</h3>
        <p className='mt-2 text-sm text-gray-500'>
          Review your statement details before submitting
        </p>
      </div>

      <div className='mx-auto max-w-md space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6'>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-600'>Statement Title:</span>
          <span className='text-sm font-medium text-gray-900'>{bankStatement || 'No title'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-600'>Transactions:</span>
          <span className='text-sm font-medium text-gray-900'>{transactions.length} records</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-600'>Mapped Columns:</span>
          <span className='text-sm font-medium text-gray-900'>
            {Object.values(mapping).filter((v) => v !== 'other').length} of {headers.length}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-600'>Validation:</span>
          <span
            className={`text-sm font-medium ${isFullyValid ? 'text-green-600' : 'text-red-600'}`}
          >
            {isFullyValid ? '✓ Valid' : '✗ Invalid'}
          </span>
        </div>
        {errors.length > 0 && (
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Validation Errors:</span>
            <span className='text-sm font-medium text-red-600'>{errors.length}</span>
          </div>
        )}
        {warnings.length > 0 && (
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Warnings:</span>
            <span className='text-sm font-medium text-yellow-600'>{warnings.length}</span>
          </div>
        )}
      </div>

      {!bankStatement && (
        <div className='mx-auto mt-4 max-w-md'>
          <p className='text-left text-sm font-semibold'>
            <span className='mr-1 text-red-700'>*</span>Statement Title is required.
          </p>
        </div>
      )}

      {validationMessage && !isValidationMessageDismissed && (
        <div className='mx-auto mt-4 max-w-md'>
          <div className='flex items-start justify-between'>
            <p className='text-sm text-red-700'>{validationMessage}</p>
            <button
              type='button'
              onClick={handleDismissValidation}
              className='ml-2 flex-shrink-0 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600'
              title='Dismiss warning'
            >
              <XMarkIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}

      <div className='mt-6 flex justify-center gap-3'>
        <Button variant='outline' onClick={onBack}>
          Back to mapping
        </Button>
        <Button type='submit' disabled={!isFullyValid || !bankStatement || !transactions.length}>
          Upload bank statement
        </Button>
      </div>
    </div>
  );
};
