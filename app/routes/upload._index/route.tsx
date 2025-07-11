import { useFetcher, useNavigate } from '@remix-run/react';
import { useUploadActions } from './hooks/useUploadActions';
import { StepIndicator } from './components/steps/StepIndicator';
import { StepRenderer } from './components/steps/StepRenderer';
import { SuccessView } from './components/SuccessView';
import { NavigationButtons } from './components/NavigationButtons';
import { UPLOAD_STEPS } from './utils/constants';

export default function UploadRoute() {
  const {
    currentStep,
    firstFive,
    headers,
    dataHasHeaders,
    rows,
    mapping,
    billStatement,
    handleUpload,
    handleHeaderSelection,
    handleMappingChange,
    handleMappingConfirm,
    handleBackToMapping,
    handleStatementTitleChange,
    handleReset,
  } = useUploadActions();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const data = fetcher.data as any;

  const handleUploadMore = () => window.location.reload();
  const handleViewStatements = () => navigate('/bill-statements');
  const handleBackToDashboard = () => navigate('/');

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-12'>
        <h1 className='text-3xl font-light text-gray-900'>Upload Statement</h1>
        <p className='mt-2 text-gray-500'>Add a new bill statement to track expenses</p>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
        {data?.success ? (
          <SuccessView
            onUploadMore={handleUploadMore}
            onViewStatements={handleViewStatements}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          <>
            <StepIndicator currentStep={currentStep} steps={UPLOAD_STEPS} />

            <fetcher.Form action='/upload' method='POST' encType='multipart/form-data'>
              <StepRenderer
                currentStep={currentStep}
                firstFive={firstFive}
                headers={headers}
                dataHasHeaders={dataHasHeaders}
                rows={rows}
                mapping={mapping}
                billStatement={billStatement}
                onFileUpload={handleUpload}
                onHeaderSelection={handleHeaderSelection}
                onMappingChange={handleMappingChange}
                onBack={handleBackToMapping}
                onStatementTitleChange={handleStatementTitleChange}
              />

              <NavigationButtons
                currentStep={currentStep}
                mapping={mapping}
                rows={rows}
                onReset={handleReset}
                onMappingConfirm={handleMappingConfirm}
              />
            </fetcher.Form>
          </>
        )}
      </div>
    </div>
  );
}
