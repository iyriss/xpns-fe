import { ArrowRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '../../../components/Button';
import { UploadStep } from '../types';
import { validateMapping, transformAndValidateTransactions } from '../utils/validation-helpers';

interface NavigationButtonsProps {
  currentStep: UploadStep;
  mapping: Record<string, string>;
  rows: any[];
  uploadValid: boolean;
  onReset: () => void;
  onPreview: () => void;
  onGoToMapping: () => void;
  onMappingConfirm: () => void;
}

export const NavigationButtons = ({
  currentStep,
  mapping,
  rows,
  uploadValid,
  onReset,
  onPreview,
  onGoToMapping,
  onMappingConfirm,
}: NavigationButtonsProps) => {
  if (currentStep === UploadStep.SUBMIT) {
    return null;
  }

  const { errors } = transformAndValidateTransactions(rows, mapping);
  const isMappingValid = validateMapping(mapping).isValid && errors.length === 0;

  return (
    <div className='mt-10 flex justify-between'>
      {currentStep !== UploadStep.UPLOAD && (
        <Button onClick={onReset} variant='text'>
          Cancel
        </Button>
      )}
      {(currentStep === UploadStep.UPLOAD || currentStep === UploadStep.PREVIEW) && (
        <Button
          className='ml-auto'
          disabled={!uploadValid}
          onClick={currentStep === UploadStep.UPLOAD ? onPreview : onGoToMapping}
        >
          Next
          <ArrowRightIcon className='ml-2 h-4 w-4' />
        </Button>
      )}

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
