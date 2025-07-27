type TableRowsProps = {
  rows: any[];
  showAllRows: boolean;
  onShowAllRows: () => void;
};

export const TableRows: React.FC<TableRowsProps> = ({ rows, showAllRows, onShowAllRows }) => {
  return (
    <>
      {rows.length > 5 && (
        <div className='border-t bg-gray-50 px-4 py-3'>
          <button
            type='button'
            onClick={onShowAllRows}
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
    </>
  );
};
