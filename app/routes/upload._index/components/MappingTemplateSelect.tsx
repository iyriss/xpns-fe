import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { MappingTemplate } from '../types';

type MappingTemplateSelectProps = {
  mappingTemplates: MappingTemplate[];
  onMappingTemplateChange: (template: MappingTemplate | null) => void;
};

export const MappingTemplateSelect = ({
  mappingTemplates,
  onMappingTemplateChange,
}: MappingTemplateSelectProps) => {
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);

  function handleHeaderTemplateSelection(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === 'custom') {
      onMappingTemplateChange(null);
      return;
    }

    const template = mappingTemplates.find(({ _id }) => _id === e.target.value);
    if (template) {
      onMappingTemplateChange(template);
    }
  }

  return (
    <div className='relative flex items-center gap-8'>
      <p className='flex w-[160px] items-center text-sm font-medium text-gray-700'>
        Mapping template <span className='ml-1 text-red-500'>*</span>
        <QuestionMarkCircleIcon
          className='ml-1 inline h-4 w-4 text-gray-500'
          onMouseOver={() => setShowTooltipInfo(true)}
          onMouseLeave={() => setShowTooltipInfo(false)}
        />
      </p>

      <select
        name='headers'
        required
        className='min-w-[200px] rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
        onChange={(e) => handleHeaderTemplateSelection(e)}
      >
        <option value={'custom'} className='text-gray-500' defaultChecked>
          Custom
        </option>
        {mappingTemplates?.map(({ name, _id }: any) => (
          <option key={_id} value={_id}>
            {name}
          </option>
        ))}
      </select>

      {showTooltipInfo && (
        <div className='absolute left-0 top-[36px] z-10 w-1/2 rounded-lg bg-[#042644] px-4 py-2 text-sm text-white'>
          <p>Mapping helps match your CSV columns to the transaction fields in your account.</p>
          <p className='mt-2'>
            Since banks use different CSV formats, you'll need to confirm which columns match each
            field so your statement can be imported correctly.
          </p>
        </div>
      )}
    </div>
  );
};
