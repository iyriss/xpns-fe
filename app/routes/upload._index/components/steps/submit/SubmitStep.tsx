import { useState } from 'react';
import {
  validateMapping,
  transformAndValidateTransactions,
} from '../../../utils/validation-helpers';
import { Button } from '../../../../../components/Button';
import { ArrowUpTrayIcon, DocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

export const SubmitStep = ({
  bankStatement,
  rows,
  mapping,
  headers,
  onBack,
  onReset,
  validationMessage,
}: {
  bankStatement: string;
  rows: any[];
  mapping: Record<string, string>;
  headers: string[];
  onBack: () => void;
  onReset: () => void;
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
        {errors.length === 0 && (
          <>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20'>
              <DocumentCheckIcon className='h-8 w-8 !text-primary' />
            </div>
            <h3 className='mt-4 text-lg font-medium text-gray-900'>Ready to upload</h3>
          </>
        )}
        <p className='mt-2'>Review your statement details before submitting</p>
      </div>

      <div className='mx-auto max-w-md space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6'>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-600'>Statement Title:</span>
          <span className='text-sm font-medium text-gray-900'>{bankStatement}</span>
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

      {validationMessage && !isValidationMessageDismissed && (
        <div className='mx-auto mt-4 max-w-md'>
          <div className='flex items-start justify-between'>
            <p className='text-sm' dangerouslySetInnerHTML={{ __html: validationMessage }} />
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

      <div className='mt-12 flex justify-between gap-5'>
        <Button variant='text' onClick={onReset}>
          Cancel
        </Button>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={onBack}>
            Back to mapping
          </Button>
          <Button type='submit' disabled={!isFullyValid || !transactions.length}>
            <ArrowUpTrayIcon className='mr-2 h-4 w-4' />
            Upload bank statement
          </Button>
        </div>
      </div>
    </div>
  );
};
