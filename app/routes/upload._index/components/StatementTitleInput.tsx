export const StatementTitleInput = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className='flex items-center gap-8'>
    <label htmlFor='bankStatement' className='block w-[160px] text-sm font-medium text-gray-700'>
      Statement title <span className='text-red-500'>*</span>
    </label>
    <input
      name='bankStatement'
      id='bankStatement'
      className='rounded-lg border border-gray-200 px-4 py-3 font-medium placeholder:text-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
      required
      onChange={onChange}
    />
  </div>
);
