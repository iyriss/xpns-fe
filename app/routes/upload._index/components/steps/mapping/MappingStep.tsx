import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { ColumnTypeSelector } from './ColumnTypeSelector';
import { formatNumberWithCommas } from '../../../../../utils/numbers-helpers';

export const MappingStep = ({
  headers,
  rows,
  dataHasHeaders,
  mapping,
  onMappingChange,
  validationMessage,
}: {
  headers: string[];
  rows: any[];
  dataHasHeaders: boolean | null;
  mapping: Record<string, string>;
  onMappingChange: (col: string, value: string) => void;
  validationMessage?: string | null;
}) => {
  const [showAllRows, setShowAllRows] = useState(false);
  const previewRows = showAllRows ? rows : rows.slice(0, 5);

  return (
    <>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Map your columns</h3>
        <p className='text-sm text-gray-600'>Select what each column represents.</p>
        <p className='mt-4 flex items-center gap-1 text-sm'>
          <InformationCircleIcon className='h-4 w-4 text-accent' />
          <span className='font-medium'>Required fields:</span> Date, Description, and either Amount
          + Type OR both Debit/Credit columns.
        </p>
      </div>

      <div className='my-5'>
        {validationMessage && (
          <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-700'>{validationMessage}</p>
          </div>
        )}
      </div>

      <div className='mt-5 rounded-lg border'>
        <table className='w-full'>
          {dataHasHeaders && (
            <thead className='bg-gray-50'>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            <tr className='border-t'>
              {headers.map((header) => (
                <td key={header} className='px-4 py-3'>
                  <ColumnTypeSelector
                    value={mapping[header] || 'other'}
                    onChange={(value) => onMappingChange(header, value)}
                  />
                </td>
              ))}
            </tr>
            {previewRows.map((row, rowIndex) => (
              <tr key={rowIndex} className='border-t border-gray-100'>
                {Object.values(row).map((value, index) => (
                  <td key={index} className='px-4 py-2 text-sm text-gray-600'>
                    {formatNumberWithCommas(value).slice(0, 20)}
                    {formatNumberWithCommas(value).length > 20 ? '...' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > 5 && (
          <div className='border-t bg-gray-50 px-4 py-3'>
            <button
              type='button'
              onClick={() => setShowAllRows(!showAllRows)}
              className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900'
            >
              {showAllRows ? (
                <>
                  <span>Show less</span>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 15l7-7 7 7'
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show all {rows.length} transactions</span>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
