import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/Button';
import { useState } from 'react';

type CustomAllocationFormProps = {
  allocationBase: 'fixed' | 'percentage';
  users: any[];
  amount: number;
  formRef: React.RefObject<HTMLDivElement>;
  onAllocationBaseChange: (allocationBase: 'fixed' | 'percentage') => void;
};

export default function CustomAllocationForm({
  allocationBase,
  users,
  amount,
  onAllocationBaseChange,
  formRef,
}: CustomAllocationFormProps) {
  const [members, setMembers] = useState(0);

  const handleAddMember = () => {
    setMembers((prev) => prev + 1);
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
            <select name={`user-${index}`} required className='h-10 min-w-20 border px-2 py-2'>
              <option value=''>Select</option>
              {users.map((user: any) => (
                <option key={user._id} value={user._id}>
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
              min={1}
              max={allocationBase === 'percentage' ? 99 : amount}
              name={`amount-${index}`}
              className={`h-10 min-w-[206px] border px-4 py-2 text-right`}
            />
            {allocationBase === 'percentage' && (
              <div className='flex h-10 w-5 items-center justify-center border border-l-0 bg-white'>
                %
              </div>
            )}
          </div>
          {index === members && (
            <Button className='flex items-center gap-1' variant='text' onClick={handleAddMember}>
              <PlusIcon className='size-3 text-primary' />
              <span className='text-sm text-primary'>Add</span>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
