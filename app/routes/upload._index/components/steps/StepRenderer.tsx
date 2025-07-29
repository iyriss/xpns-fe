import { UploadStep, MappingTemplate } from '../../types';
import { FileUpload } from './upload/FileUpload';
import { PreviewStep } from './preview/PreviewStep';
import { MappingStep } from './mapping/MappingStep';
import { SubmitStep } from './submit/SubmitStep';
import { StatementTitleInput } from '../StatementTitleInput';
import { getValidationMessage } from '../../utils/validation-helpers';
import { MappingTemplateSelect } from '../MappingTemplateSelect';
import { MappingTemplateStep } from './mapping-template/MappingTemplateStep';

interface StepRendererProps {
  currentStep: UploadStep;
  firstFive: any[];
  template: string;
  headers: string[];
  mappingTemplates: MappingTemplate[];
  dataHasHeaders: boolean | null;
  rows: any[];
  mapping: Record<string, string>;
  bankStatement: string;
  csvFile: File | null;
  onFileUpload: (files: FileList | null) => void;
  onHeaderSelection: (hasHeaders: boolean) => void;
  onMappingChange: (col: string, value: string) => void;
  onBack: () => void;
  onStatementTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMappingTemplateChange: (template: MappingTemplate | null) => void;
}

export const StepRenderer = ({
  currentStep,
  firstFive,
  template,
  headers,
  mappingTemplates,
  dataHasHeaders,
  rows,
  mapping,
  bankStatement,
  csvFile,
  onFileUpload,
  onHeaderSelection,
  onMappingChange,
  onBack,
  onStatementTitleChange,
  onMappingTemplateChange,
}: StepRendererProps) => {
  const templateName = mappingTemplates.find(({ _id }) => _id === template)?.name || '';

  const renderStepContent = () => {
    switch (currentStep) {
      case UploadStep.UPLOAD:
        return (
          <>
            <StatementTitleInput onChange={onStatementTitleChange} />
            <MappingTemplateSelect
              mappingTemplates={mappingTemplates}
              onMappingTemplateChange={onMappingTemplateChange}
            />
            <FileUpload onFileUpload={onFileUpload} csvFile={csvFile} />
          </>
        );
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
      case UploadStep.MAPPING_TEMPLATE:
        return (
          <MappingTemplateStep
            headers={headers}
            rows={rows}
            templateName={templateName}
            onBackToMapping={onBack}
          />
        );
      case UploadStep.SUBMIT:
        return (
          <SubmitStep
            bankStatement={bankStatement}
            rows={rows}
            mapping={mapping}
            headers={headers}
            onBack={onBack}
            validationMessage={getValidationMessage(mapping, rows)}
          />
        );
      default:
        return <FileUpload onFileUpload={onFileUpload} csvFile={csvFile} />;
    }
  };

  return <div className='space-y-5'>{renderStepContent()}</div>;
};
