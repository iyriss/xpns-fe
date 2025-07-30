import { useState } from 'react';
import { formatNumberWithCommas } from '../../../../../utils/numbers-helpers';
import { Button } from '../../../../../components/Button';
import { TableRows } from '../../TableRows';

export const MappingTemplateStep = ({
  headers,
  rows,
  templateName,
  validationMessage,
  onBackToMapping,
}: {
  headers: string[];
  rows: any[];
  templateName: string;
  validationMessage?: string | null;
  onBackToMapping: () => void;
}) => {
  const [showAllRows, setShowAllRows] = useState(false);
  const previewRows = showAllRows ? rows : rows.slice(0, 5);

  return (
    <>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Confirm mapping</h3>
        <p className='inline-block text-sm'>
          Ensure column headers match the mapping template you selected. If you need to change the
          column types, you can do so by changing the mapping template.
        </p>
        {validationMessage && (
          <div className='mt-1'>
            <p className='text-sm font-semibold text-red-700'>{validationMessage}</p>
          </div>
        )}
      </div>
      <div className='mt-2 flex items-center gap-2'>
        <span className='text-sm text-gray-500'>Current mapping template:</span>
        <span className='rounded-md bg-accent px-2 py-1 font-semibold text-white'>
          {templateName}
        </span>
        <Button variant='text' className='text-sm' onClick={onBackToMapping}>
          Change
        </Button>
      </div>

      <div className='mt-5 rounded-lg border'>
        <table className='w-full'>
          {headers.length > 0 && (
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
