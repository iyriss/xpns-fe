import { DocumentTextIcon } from '@heroicons/react/24/solid';
import { FileDisplay } from './FileDisplay';

export const FileUpload = ({
  onFileUpload,
  csvFile,
}: {
  onFileUpload: (files: FileList | null) => void;
  csvFile: File | null;
}) => {
  if (csvFile) {
    return <FileDisplay file={csvFile} onReplace={onFileUpload} />;
  }

  return (
    <div className='relative'>
      <p className='mb-2 text-sm font-medium text-gray-700'>
        Bank statement <span className='text-red-500'>*</span>
      </p>

      <div className='flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100'>
        <input
          type='file'
          className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
          onChange={(e) => onFileUpload(e.currentTarget.files)}
          accept='.csv'
          multiple={false}
        />
        <DocumentTextIcon className='h-12 w-12 text-gray-400' />
        <h3 className='mt-4 text-lg font-medium text-gray-900'>Upload your CSV file</h3>
        <div className='text-xs text-gray-500'>Drag and drop or click to browse</div>
      </div>
    </div>
  );
};
