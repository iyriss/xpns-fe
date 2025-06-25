import { RectangleGroupIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/Button';
import { useState, useEffect } from 'react';

type CustomAllocationFormProps = {
  allocationBase: 'fixed' | 'percentage';
  amount: number;
  groupMembers: any[];
  formRef: React.RefObject<HTMLDivElement>;
  onAllocationBaseChange: (allocationBase: 'fixed' | 'percentage') => void;
};

export default function CustomAllocationForm({
  allocationBase,
  amount,
  formRef,
  groupMembers,
  onAllocationBaseChange,
}: CustomAllocationFormProps) {
  const [members, setMembers] = useState(0);
  const [inputValues, setInputValues] = useState<{ [key: string]: number }>({});
  const [selectedUsers, setSelectedUsers] = useState<{ [key: string]: string }>({});
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    setMembers((prev) => prev + 1);
  };

  const handleRemoveMember = () => {
    setMembers((prev) => prev - 1);
  };

  const handleInputChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputValues((prev) => ({ ...prev, [`amount-${index}`]: numValue }));
  };

  const handleUserSelect = (index: number, userId: string) => {
    setSelectedUsers((prev) => ({ ...prev, [`user-${index}`]: userId }));
  };

  useEffect(() => {
    const newTotal = Object.values(inputValues).reduce((sum, val) => sum + val, 0);
    setTotal(newTotal);

    if (allocationBase === 'percentage') {
      if (newTotal > 100) {
        setError('Total cannot exceed 100%.');
      } else if (newTotal < 100) {
        setError('Total must equal 100%.');
      } else {
        setError('');
      }
    } else {
      if (newTotal > amount) {
        setError(`Total cannot exceed $${amount}.`);
      } else if (newTotal < amount) {
        setError(`Total must equal $${amount}.`);
      } else {
        setError('');
      }
    }
  }, [inputValues, allocationBase, amount]);

  const isUserSelected = (userId: string, currentIndex: number) => {
    return Object.entries(selectedUsers).some(([key, value]) => {
      const index = parseInt(key.split('-')[1]);
      return value === userId && index !== currentIndex;
    });
  };

  return (
    <div ref={formRef} className='my-4 rounded'>
      <div className='flex items-center gap-8'>
        <label className='flex min-w-[80px] items-center gap-2 text-sm text-muted'>
          <RectangleGroupIcon className='h-4 w-4' />
          Ratio
        </label>

        <div className='flex w-full items-center gap-8'>
          <label className='flex cursor-pointer items-center gap-1'>
            <div className='relative'>
              <input
                type='radio'
                name='allocationBase'
                value='fixed'
                checked={allocationBase === 'fixed'}
                onChange={() => onAllocationBaseChange('fixed')}
                className='sr-only'
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
                  allocationBase === 'fixed'
                    ? 'border-accent bg-accent'
                    : 'border-gray-400 bg-white hover:border-accent/50'
                }`}
              >
                {allocationBase === 'fixed' && (
                  <div className='h-2 w-2 rounded-full bg-white'></div>
                )}
              </div>
            </div>
            <span className='text-sm'>Fixed</span>
          </label>

          <label className='flex cursor-pointer items-center gap-1'>
            <div className='relative'>
              <input
                type='radio'
                name='allocationBase'
                value='percentage'
                checked={allocationBase === 'percentage'}
                onChange={() => onAllocationBaseChange('percentage')}
                className='sr-only'
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
                  allocationBase === 'percentage'
                    ? 'border-accent bg-accent'
                    : 'border-gray-400 bg-white hover:border-accent/50'
                }`}
              >
                {allocationBase === 'percentage' && (
                  <div className='h-2 w-2 rounded-full bg-white'></div>
                )}
              </div>
            </div>
            <span className='text-sm'>Percentage</span>
          </label>
        </div>
      </div>

      {[...Array(members + 1)].map((_, index) => (
        <div className='mt-4 flex gap-8 transition-all duration-300' key={index}>
          <select
            name={`user-${index}`}
            required
            className='h-10 min-w-20 cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm transition-all hover:border-gray-400'
            value={selectedUsers[`user-${index}`] || ''}
            onChange={(e) => handleUserSelect(index, e.target.value)}
          >
            <option value=''>Select</option>
            {groupMembers.map((user: any) => (
              <option key={user._id} value={user._id} disabled={isUserSelected(user._id, index)}>
                {user.name}
              </option>
            ))}
          </select>

          <div className='flex items-center space-x-3'>
            <div className='relative flex items-center'>
              {allocationBase === 'fixed' && (
                <div className='flex h-10 w-5 items-center justify-center rounded-l border border-r-0 bg-white'>
                  $
                </div>
              )}
              <input
                type='number'
                min={0.01}
                step={0.01}
                max={allocationBase === 'percentage' ? 100 : amount}
                name={`amount-${index}`}
                value={inputValues[`amount-${index}`] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={`h-10 min-w-[206px] border px-4 py-2 text-right ${error ? 'border-error' : ''}`}
              />
              {allocationBase === 'percentage' && (
                <div className='flex h-10 w-5 items-center justify-center rounded-r border border-l-0 bg-white'>
                  %
                </div>
              )}
            </div>

            {index < groupMembers.length - 1 && (
              <Button className='flex items-center gap-1' variant='text' onClick={handleAddMember}>
                <span className='text-sm text-primary'>Add</span>
              </Button>
            )}

            {index > 0 && (
              <div
                className='flex items-center gap-1 text-red-500 hover:underline'
                onClick={handleRemoveMember}
              >
                <span className='text-sm text-red-500'>Delete</span>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className='mt-4 flex justify-between'>
        <div className='text-sm text-muted'>
          Total: {allocationBase === 'fixed' ? '$' : ''}
          {total.toFixed(2)}
          {allocationBase === 'percentage' ? '%' : ''}
        </div>
        {error && <div className='text-sm text-error'>{error}</div>}
      </div>
    </div>
  );
}
