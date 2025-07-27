import { ArrowRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '../../../components/Button';
import { UploadStep } from '../types';
import { validateMapping, transformAndValidateTransactions } from '../utils/validation-helpers';

interface NavigationButtonsProps {
  currentStep: UploadStep;
  mapping: Record<string, string>;
  rows: any[];
  onReset: () => void;
  onMappingConfirm: () => void;
}

export const NavigationButtons = ({
  currentStep,
  mapping,
  rows,
  onReset,
  onMappingConfirm,
}: NavigationButtonsProps) => {
  if (currentStep === UploadStep.SUBMIT || currentStep === UploadStep.UPLOAD) {
    return null;
  }

  const { errors } = transformAndValidateTransactions(rows, mapping);
  const isMappingValid = validateMapping(mapping).isValid && errors.length === 0;

  return (
    <div className='mt-10 flex justify-between'>
      <Button type='button' onClick={onReset} variant='text'>
        <ArrowUturnLeftIcon className='mr-2 h-4 w-4' />
        Restart
      </Button>
      {(currentStep === UploadStep.MAPPING || currentStep === UploadStep.MAPPING_TEMPLATE) && (
        <button
          className='flex items-center bg-primary px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-500/40'
          onClick={onMappingConfirm}
          disabled={!isMappingValid}
        >
          Confirm column types
          <ArrowRightIcon className='ml-2 h-4 w-4' />
        </button>
      )}
    </div>
  );
};
