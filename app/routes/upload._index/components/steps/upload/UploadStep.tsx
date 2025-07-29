import { MappingTemplate } from '../../../types';
import { MappingTemplateSelect } from '../../MappingTemplateSelect';
import { StatementTitleInput } from '../../StatementTitleInput';
import { FileUpload } from './FileUpload';

export const UploadStep = ({
  csvFile,
  mappingTemplates,
  onStatementTitleChange,
  onMappingTemplateChange,
  onFileUpload,
}: {
  csvFile: File | null;
  mappingTemplates: MappingTemplate[];
  onStatementTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMappingTemplateChange: (template: MappingTemplate | null) => void;
  onFileUpload: (files: FileList | null) => void;
}) => {
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
};
