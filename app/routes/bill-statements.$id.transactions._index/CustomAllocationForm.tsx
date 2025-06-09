import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
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
        setError('Total cannot exceed 100%');
      } else if (newTotal < 100) {
        setError('Total must equal 100%');
      } else {
        setError('');
      }
    } else {
      if (newTotal > amount) {
        setError(`Total cannot exceed $${amount}`);
      } else if (newTotal < amount) {
        setError(`Total must equal $${amount}`);
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
      <div className='flex items-center gap-4'>
        <div className='min-w-[100px]'>Ratio</div>
        <div className='flex w-full items-center'>
          <label
            className={`min-w-[108px] cursor-pointer rounded-bl rounded-tl border border-primary px-4 py-2 text-center ${allocationBase === 'fixed' ? 'bg-primary text-white' : ''}`}
          >
            <input
              type='radio'
              name='allocationBase'
              value='fixed'
              checked={allocationBase === 'fixed'}
              onChange={() => onAllocationBaseChange('fixed')}
              className='peer sr-only'
            />
            <span>Fixed</span>
          </label>
          <label
            className={`min-w-[108px] cursor-pointer rounded-br rounded-tr border border-primary px-4 py-2 text-center ${allocationBase === 'percentage' ? 'bg-primary text-white' : ''}`}
          >
            <input
              type='radio'
              name='allocationBase'
              value='percentage'
              checked={allocationBase === 'percentage'}
              onChange={() => onAllocationBaseChange('percentage')}
              className='peer sr-only'
            />
            <span>Percentage</span>
          </label>
        </div>
      </div>

      {[...Array(members + 1)].map((_, index) => (
        <div className='flex gap-4 py-4 transition-all duration-300' key={index}>
          <div className='min-w-[100px]'>
            <select
              name={`user-${index}`}
              required
              className='h-10 min-w-20 border px-2 py-2'
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
          </div>
          <div className='relative flex items-center'>
            {allocationBase === 'fixed' && (
              <div className='flex h-10 w-5 items-center justify-center border border-r-0 bg-white'>
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
              <div className='flex h-10 w-5 items-center justify-center border border-l-0 bg-white'>
                %
              </div>
            )}
          </div>
          {index < groupMembers.length - 1 && (
            <Button className='flex items-center gap-1' variant='text' onClick={handleAddMember}>
              <PlusIcon className='size-3 text-primary' />
              <span className='text-sm text-primary'>Add</span>
            </Button>
          )}
          {index > 0 && (
            <div
              className='flex items-center gap-1 text-red-500 hover:underline'
              onClick={handleRemoveMember}
            >
              <MinusIcon className='size-3 text-red-500' />
              <span className='text-sm text-red-500'>Remove</span>
            </div>
          )}
        </div>
      ))}

      <div className='mt-2 flex justify-between px-4'>
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
