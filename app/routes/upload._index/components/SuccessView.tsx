import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from '../../../components/Button';

interface SuccessViewProps {
  onUploadMore: () => void;
  onViewStatements: () => void;
  onBackToDashboard: () => void;
}

export const SuccessView = ({
  onUploadMore,
  onViewStatements,
  onBackToDashboard,
}: SuccessViewProps) => (
  <div className='py-12 text-center'>
    <div className='mb-6 text-2xl'>✅</div>
    <h2 className='mb-4 text-xl font-light text-gray-900'>Transactions uploaded successfully</h2>
    <div className='mx-auto flex max-w-xs flex-col gap-3'>
      <Button type='button' onClick={onUploadMore}>
        <PlusIcon className='mr-2 h-4 w-4' />
        Upload more
      </Button>
      <Button type='button' onClick={onViewStatements} variant='outline'>
        View statements
      </Button>
      <Button type='button' onClick={onBackToDashboard} variant='outline'>
        Back to dashboard
      </Button>
    </div>
  </div>
);
