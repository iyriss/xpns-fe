import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Button } from '../../../components/Button';
import { UploadStep } from '../types';
import {
  validateMapping,
  validateDataTypes,
  validateDataConsistency,
} from '../utils/validation-helpers';

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

  const isMappingValid =
    validateMapping(mapping).isValid &&
    validateDataTypes(mapping, rows).length === 0 &&
    validateDataConsistency(mapping, rows).errors.length === 0;

  return (
    <div className='mt-10 flex justify-between'>
      <Button type='button' onClick={onReset} variant='text'>
        <ArrowLeftIcon className='mr-2 h-4 w-4' />
        Back
      </Button>
      {currentStep === UploadStep.MAPPING && (
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
