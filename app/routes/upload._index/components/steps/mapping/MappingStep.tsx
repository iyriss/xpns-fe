import { useState } from 'react';
import { ColumnTypeSelector } from './ColumnTypeSelector';
import { formatNumberWithCommas } from '../../../../../utils/numbers-helpers';
import { TableRows } from '../../TableRows';
import { Toggle } from '../../../../../components/Toggle';

export const MappingStep = ({
  headers,
  rows,
  dataHasHeaders,
  mapping,
  validationMessage,
  onMappingChange,
}: {
  headers: string[];
  rows: any[];
  dataHasHeaders: boolean | null;
  mapping: Record<string, string>;
  validationMessage?: string | null;
  onMappingChange: (col: string, value: string) => void;
}) => {
  const [showAllRows, setShowAllRows] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
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
      <div>
        <div className='flex items-center gap-10'>
          <div className='flex h-10 items-center justify-end gap-2'>
            <Toggle checked={saveAsTemplate} onChange={() => setSaveAsTemplate(!saveAsTemplate)} />
            <span className='text-sm'>Save mapping as template</span>
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            saveAsTemplate ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className='flex items-center gap-5'>
            <label htmlFor='mappingTitle' className='block text-sm font-medium text-gray-700'>
              Mapping name<span className='text-red-500'>*</span>
            </label>
            <input
              name='mappingTitle'
              id='mappingTitle'
              className='rounded-lg border border-gray-200 px-4 py-3 font-medium placeholder:text-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
              required
            />
          </div>
        </div>
      </div>
      <div className='mt-2 rounded-lg border'>
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
