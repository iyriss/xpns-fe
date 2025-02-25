import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/Button';
import { useState } from 'react';

type AllocationFormProps = {
  allocationBase: 'fixed' | 'percentage';
  users: any[];
  onAllocationBaseChange: (allocationBase: 'fixed' | 'percentage') => void;
};

export default function AllocationForm({
  allocationBase,
  onAllocationBaseChange,
  users,
}: AllocationFormProps) {
  const [members, setMembers] = useState(0);

  const handleAddMember = () => {
    setMembers((prev) => prev + 1);
  };
  return (
    <div className='my-4 rounded bg-gray-100 p-4'>
      <div className='flex items-center gap-4'>
        <div className='min-w-[100px]'>Ratio</div>
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              name='allocationBase'
              value='fixed'
              checked={allocationBase === 'fixed'}
              onChange={(e) => onAllocationBaseChange(e.target.value as 'fixed' | 'percentage')}
            />
            <label htmlFor='allocationBase'>Fixed</label>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              name='allocationBase'
              value='percentage'
              checked={allocationBase === 'percentage'}
              onChange={(e) => onAllocationBaseChange(e.target.value as 'fixed' | 'percentage')}
            />
            <label htmlFor='allocationBase'>Percentage</label>
          </div>
        </div>
      </div>

      {[...Array(members + 1)].map((_, index) => (
        <div className='flex gap-4 py-4 transition-all duration-300' key={index}>
          <div className='min-w-[100px]'>
            <select name={`kind-${index}`} required className='h-10 border px-4 py-2'>
              {users.map((user: any) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className='relative flex items-center'>
            {allocationBase === 'fixed' && (
              <div className='h-10 border border-r-0 bg-white p-2 text-muted'>$</div>
            )}
            <input
              type='number'
              name={`amount-${index}`}
              className={`h-10 max-w-[80px] border px-4 py-2`}
            />
            {allocationBase === 'percentage' && (
              <div className='h-10 border border-l-0 bg-white p-2 text-muted'>%</div>
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
