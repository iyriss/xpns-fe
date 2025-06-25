import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

type CategoryDropdownProps = {
  transactionId: string;
  currentCategory?: string;
  categories: any[];
  onClose: () => void;
  onCategorySelect: (categoryId: string) => void;
};

const typeEmojis: { [key: string]: string } = {
  essentials: '🍎',
  lifestyle: '🛍️',
  wellness: '🩺',
  financial: '💰',
  pet: '🐶',
  home: '🏠',
  other: '🧩',
};

export default function CategoryDropdown({
  currentCategory,
  categories,
  onClose,
  onCategorySelect,
}: CategoryDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const groupedCategories = categories.reduce((acc: any, category: any) => {
    const type = category.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category);
    return acc;
  }, {});

  const filteredGroupedCategories = Object.keys(groupedCategories).reduce((acc: any, type) => {
    const filteredCategories = groupedCategories[type].filter((category: any) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    if (filteredCategories.length > 0) {
      acc[type] = filteredCategories;
    }
    return acc;
  }, {});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const hasResults = Object.keys(filteredGroupedCategories).length > 0;

  return (
    <div
      ref={dropdownRef}
      className='absolute left-0 top-0 z-50 w-80 rounded-lg border border-border/40 bg-white py-4 shadow-lg'
    >
      <div className='mb-4 px-4'>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input
            type='text'
            placeholder='Search categories...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-md border border-border/40 py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none'
            autoFocus
          />
        </div>
      </div>

      <div className='max-h-60 overflow-y-auto'>
        {!hasResults ? (
          <div className='py-4 text-center text-sm text-muted'>
            {searchTerm ? 'No categories found' : 'No categories available'}
          </div>
        ) : (
          <div className='space-y-3'>
            {Object.entries(filteredGroupedCategories).map(([type, categories]) => (
              <div key={type}>
                <div className='mb-2 flex items-center gap-2 bg-slate-100 px-4 py-1'>
                  <span className='text-lg'>{typeEmojis[type] || '📁'}</span>
                  <span className='text-xs font-semibold uppercase tracking-wide text-muted'>
                    {type}
                  </span>
                </div>

                <div className='space-y-1'>
                  {(categories as any[]).map((category: any) => (
                    <button
                      key={category._id}
                      onClick={() => onCategorySelect(category._id)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-border ${
                        currentCategory === category._id
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <span className='flex-1'>{category.name}</span>
                        {currentCategory === category._id && (
                          <span className='text-xs text-primary'>✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
