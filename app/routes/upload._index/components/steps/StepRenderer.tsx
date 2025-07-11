import { UploadStep } from '../../types';
import { FileUpload } from './upload/FileUpload';
import { PreviewStep } from './preview/PreviewStep';
import { MappingStep } from './mapping/MappingStep';
import { SubmitStep } from './submit/SubmitStep';
import { StatementTitleInput } from '../StatementTitleInput';
import { getValidationMessage } from '../../utils/validation-helpers';

interface StepRendererProps {
  currentStep: UploadStep;
  firstFive: any[];
  headers: string[];
  dataHasHeaders: boolean | null;
  rows: any[];
  mapping: Record<string, string>;
  billStatement: string;
  onFileUpload: (files: FileList | null) => void;
  onHeaderSelection: (hasHeaders: boolean) => void;
  onMappingChange: (col: string, value: string) => void;
  onBack: () => void;
  onStatementTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StepRenderer = ({
  currentStep,
  firstFive,
  headers,
  dataHasHeaders,
  rows,
  mapping,
  billStatement,
  onFileUpload,
  onHeaderSelection,
  onMappingChange,
  onBack,
  onStatementTitleChange,
}: StepRendererProps) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case UploadStep.UPLOAD:
        return <FileUpload onFileUpload={onFileUpload} />;
      case UploadStep.PREVIEW:
        return (
          <PreviewStep
            firstFive={firstFive}
            headers={headers}
            dataHasHeaders={dataHasHeaders}
            onHeaderSelection={onHeaderSelection}
          />
        );
      case UploadStep.MAPPING:
        return (
          <MappingStep
            headers={headers}
            rows={rows}
            dataHasHeaders={dataHasHeaders}
            mapping={mapping}
            onMappingChange={onMappingChange}
            validationMessage={getValidationMessage(mapping, rows)}
          />
        );
      case UploadStep.SUBMIT:
        return (
          <SubmitStep
            billStatement={billStatement}
            rows={rows}
            mapping={mapping}
            headers={headers}
            onBack={onBack}
            validationMessage={getValidationMessage(mapping, rows)}
          />
        );
      default:
        return <FileUpload onFileUpload={onFileUpload} />;
    }
  };

  return (
    <div className='space-y-5'>
      <StatementTitleInput onChange={onStatementTitleChange} />
      {renderStepContent()}
    </div>
  );
};
