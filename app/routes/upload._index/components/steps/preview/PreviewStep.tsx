import { PreviewTable } from './PreviewTable';

export const PreviewStep = ({
  firstFive,
  headers,
  dataHasHeaders,
  onHeaderSelection,
}: {
  firstFive: any[];
  headers: string[];
  dataHasHeaders: boolean | null;
  onHeaderSelection: (hasHeaders: boolean) => void;
}) => (
  <div className='mb-6'>
    <h3 className='text-lg font-medium text-gray-900'>Review your data</h3>
    <PreviewTable firstFive={firstFive} headers={headers} />

    <div className='mt-5'>
      <p>Select the content of the highlighted top row on your CSV snippet.</p>
      <div className='mt-2 flex items-center gap-8'>
        <label className='flex flex-1 cursor-pointer items-center gap-2'>
          <div className='relative'>
            <input
              type='radio'
              name='tableHeaders'
              value='headers'
              checked={dataHasHeaders === true}
              onChange={() => onHeaderSelection(true)}
              className='sr-only'
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
                dataHasHeaders === true
                  ? 'border-accent bg-accent'
                  : 'border-gray-400 bg-white hover:border-accent/50'
              }`}
            >
              {dataHasHeaders === true && <div className='h-2 w-2 rounded-full bg-white'></div>}
            </div>
          </div>
          <span>Headers</span>
        </label>

        <label className='flex flex-1 cursor-pointer items-center gap-2'>
          <div className='relative'>
            <input
              type='radio'
              name='tableHeaders'
              value='data'
              checked={dataHasHeaders === false}
              onChange={() => onHeaderSelection(false)}
              className='sr-only'
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
                dataHasHeaders === false
                  ? 'border-accent bg-accent'
                  : 'border-gray-400 bg-white hover:border-accent/50'
              }`}
            >
              {dataHasHeaders === false && <div className='h-2 w-2 rounded-full bg-white'></div>}
            </div>
          </div>
          <span>Transaction data</span>
        </label>
      </div>
    </div>
  </div>
);
