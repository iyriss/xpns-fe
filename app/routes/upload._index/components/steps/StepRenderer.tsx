import { UploadStep as UploadStepType, MappingTemplate } from '../../types';
import { PreviewStep } from './preview/PreviewStep';
import { MappingStep } from './mapping/MappingStep';
import { SubmitStep } from './submit/SubmitStep';
import { getValidationMessage } from '../../utils/validation-helpers';
import { MappingTemplateStep } from './mapping-template/MappingTemplateStep';
import { UploadStep } from './upload/UploadStep';

interface StepRendererProps {
  currentStep: UploadStepType;
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
  onHeaderSelection: (hasHeaderRow: boolean) => void;
  onMappingChange: (col: string, value: string) => void;
  onBack: () => void;
  onReset: () => void;
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
  onReset,
  onStatementTitleChange,
  onMappingTemplateChange,
}: StepRendererProps) => {
  const templateName = mappingTemplates.find(({ _id }) => _id === template)?.name || '';

  const renderStepContent = () => {
    switch (currentStep) {
      case UploadStepType.UPLOAD:
        return (
          <UploadStep
            csvFile={csvFile}
            onStatementTitleChange={onStatementTitleChange}
            mappingTemplates={mappingTemplates}
            onMappingTemplateChange={onMappingTemplateChange}
            onFileUpload={onFileUpload}
          />
        );
      case UploadStepType.PREVIEW:
        return (
          <PreviewStep
            firstFive={firstFive}
            headers={headers}
            dataHasHeaders={dataHasHeaders}
            onHeaderSelection={onHeaderSelection}
          />
        );
      case UploadStepType.MAPPING:
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
      case UploadStepType.MAPPING_TEMPLATE:
        return (
          <MappingTemplateStep
            headers={headers}
            rows={rows}
            templateName={templateName}
            onBackToMapping={onBack}
            validationMessage={getValidationMessage(mapping, rows)}
          />
        );
      case UploadStepType.SUBMIT:
        return (
          <SubmitStep
            bankStatement={bankStatement}
            rows={rows}
            mapping={mapping}
            headers={headers}
            onBack={onBack}
            onReset={onReset}
            validationMessage={getValidationMessage(mapping, rows)}
          />
        );
      default:
        return (
          <UploadStep
            csvFile={csvFile}
            onStatementTitleChange={onStatementTitleChange}
            mappingTemplates={mappingTemplates}
            onMappingTemplateChange={onMappingTemplateChange}
            onFileUpload={onFileUpload}
          />
        );
    }
  };

  return <div className='space-y-5'>{renderStepContent()}</div>;
};
