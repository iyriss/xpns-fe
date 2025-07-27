import { UploadStep } from '../../types';

export const StepIndicator = ({
  currentStep,
  steps,
}: {
  currentStep: UploadStep;
  steps: { key: UploadStep; label: string; description: string }[];
}) => (
  <div className='mb-8'>
    <div className='flex items-center justify-between'>
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted =
          steps.findIndex((s) => s.key === currentStep) >
          steps.findIndex((s) => s.key === step.key);

        return (
          <div
            key={step.key}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div className='flex flex-col items-center'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-accent bg-accent text-white'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className='mt-2 text-center'>
                <div
                  className={`text-sm font-medium ${isActive ? 'text-accent' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {step.label}
                </div>
                <div className='text-xs text-gray-400'>{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 transition-all duration-200 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);
