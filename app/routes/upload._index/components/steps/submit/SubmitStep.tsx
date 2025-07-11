import {
  validateDataConsistency,
  validateDataTypes,
  validateMapping,
} from '../../../utils/validation-helpers';

export const SubmitStep = ({
  billStatement,
  rows,
  mapping,
  headers,
  onBack,
  validationMessage,
}: {
  billStatement: string;
  rows: any[];
  mapping: Record<string, string>;
  headers: string[];
  onBack: () => void;
  validationMessage?: string | null;
}) => {
  const validation = validateMapping(mapping);
  const dataTypeErrors = validateDataTypes(mapping, rows);
  const consistencyErrors = validateDataConsistency(mapping, rows);
  const isFullyValid =
    validation.isValid && dataTypeErrors.length === 0 && consistencyErrors.errors.length === 0;

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
          <span className='text-sm font-medium text-gray-900'>{billStatement || 'No title'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-600'>Transactions:</span>
          <span className='text-sm font-medium text-gray-900'>{rows.length} records</span>
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
        {dataTypeErrors.length > 0 && (
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Data Type Issues:</span>
            <span className='text-sm font-medium text-red-600'>{dataTypeErrors.length}</span>
          </div>
        )}
        {consistencyErrors.errors.length > 0 && (
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Consistency Issues:</span>
            <span className='text-sm font-medium text-red-600'>
              {consistencyErrors.errors.length}
            </span>
          </div>
        )}
        {consistencyErrors.warnings.length > 0 && (
          <div className='flex justify-between'>
            <span className='text-sm text-gray-600'>Warnings:</span>
            <span className='text-sm font-medium text-yellow-600'>
              {consistencyErrors.warnings.length}
            </span>
          </div>
        )}
      </div>

      {validationMessage && (
        <div className='mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 p-4'>
          <p className='text-sm text-red-700'>{validationMessage}</p>
        </div>
      )}

      <div className='mt-6 flex justify-center gap-3'>
        <Button variant='outline' onClick={onBack}>
          Back to mapping
        </Button>
        <Button type='submit' disabled={!isFullyValid || !billStatement || !rows.length}>
          Upload Statement
        </Button>
      </div>
    </div>
  );
};
