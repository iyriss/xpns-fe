import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Button } from '../../../../../components/Button';

interface FileDisplayProps {
  file: File;
  onReplace: (files: FileList | null) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileDisplay = ({ file, onReplace }: FileDisplayProps) => {
  return (
    <div>
      <p className='mb-2 text-sm font-medium text-gray-700'>Bank statement</p>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <DocumentTextIcon className='h-8 w-8 text-gray-400' />
          <div>
            <h3 className='text-sm text-gray-900'>{file.name}</h3>
            <p className='text-xs text-gray-600'>{formatFileSize(file.size)}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            type='button'
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.multiple = false;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                onReplace(target.files);
              };
              input.click();
            }}
            className='text-sm'
          >
            Replace
          </Button>
          <Button
            variant='destructive'
            type='button'
            onClick={() => onReplace(null)}
            className='text-sm'
          >
            <XMarkIcon className='mr-1 inline h-3 w-3' />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};
