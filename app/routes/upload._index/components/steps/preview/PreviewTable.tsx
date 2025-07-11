import { formatNumberWithCommas } from '../../../../../utils/numbers-helpers';

export const PreviewTable = ({ firstFive, headers }: { firstFive: any[]; headers: string[] }) => (
  <table className='w-full table-fixed border-collapse shadow-sm'>
    <thead>
      {firstFive.map((row, rowIndex) => (
        <tr
          key={`${row}-${rowIndex}`}
          className={`border-t border-gray-100/50 ${rowIndex === 0 ? 'bg-accent' : ''}`}
        >
          <th
            className={`w-8 px-2 py-3 text-xs font-normal text-gray-400 ${
              rowIndex === 0 ? 'text-white/70' : ''
            }`}
          >
            {rowIndex + 1}
          </th>

          {Array.isArray(row)
            ? row.map((col, colIndex) => (
                <th
                  key={`${col}-${colIndex}`}
                  className={`px-4 py-3 text-sm ${rowIndex === 0 ? 'font-bold text-white' : 'font-normal text-gray-600'}`}
                  style={{ width: `${100 / (headers.length || row.length)}%` }}
                >
                  {col}
                </th>
              ))
            : Object.values(row).map((col, colIndex) => (
                <th
                  key={`${col}-${colIndex}`}
                  className={`px-4 py-3 text-sm ${rowIndex === 0 ? 'font-bold text-white' : 'font-normal text-gray-600'}`}
                  style={{ width: `${100 / (headers.length || Object.keys(row).length)}%` }}
                >
                  {formatNumberWithCommas(col)}
                </th>
              ))}
        </tr>
      ))}
    </thead>
  </table>
);
