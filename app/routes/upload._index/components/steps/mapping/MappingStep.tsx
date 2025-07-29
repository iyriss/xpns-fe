import { useState } from 'react';
import { ColumnTypeSelector } from './ColumnTypeSelector';
import { formatNumberWithCommas } from '../../../../../utils/numbers-helpers';
import { TableRows } from '../../TableRows';

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
        <h3 className='text-lg font-medium text-gray-900'>Confirm mapping</h3>
        <p className='inline-block text-sm'>
          Ensure <span className='font-semibold'>Date, Description,</span> and either{' '}
          <span className='font-semibold'>Amount & Type</span> OR both{' '}
          <span className='font-semibold'>Debit & Credit</span> are properly mapped to the correct
          column.
        </p>
        {validationMessage && (
          <div className='mt-1'>
            <p className='text-sm font-semibold text-red-700'>{validationMessage}</p>
          </div>
        )}
      </div>

      <div className='mt-5 rounded-lg border'>
        <table className='w-full'>
          {dataHasHeaders && (
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-8 px-2 py-3 text-left text-xs font-medium text-gray-400'>#</th>
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
              <td className='w-8 px-2 py-3 text-xs text-gray-400'>-</td>
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
                <td className='w-12 px-2 py-2 text-xs text-gray-400'>{rowIndex + 1}</td>
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

        <TableRows
          rows={previewRows}
          showAllRows={showAllRows}
          onShowAllRows={() => setShowAllRows(!showAllRows)}
        />
      </div>
    </>
  );
};
