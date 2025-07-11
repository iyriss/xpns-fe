export const StatementTitleInput = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label htmlFor='billStatement' className='mb-2 block text-sm font-medium text-gray-700'>
      Statement Title <span className='text-red-500'>*</span>
    </label>
    <input
      name='billStatement'
      id='billStatement'
      className='w-full rounded-lg border border-gray-200 px-4 py-3 font-medium placeholder:text-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
      required
      placeholder='e.g. July 2024 Checking account'
      onChange={onChange}
    />
  </div>
);
