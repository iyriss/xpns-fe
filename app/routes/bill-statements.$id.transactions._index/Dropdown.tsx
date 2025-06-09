import { useEffect, useRef } from 'react';

type DropdownProps = {
  onClose: () => void;
};

export default function Dropdown({ onClose }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className='absolute right-2 top-10 z-10 rounded border border-border bg-white py-2 shadow-sm'
    >
      <div className='cursor-pointer px-3 py-1 hover:bg-border'>Allocate</div>
      <div className='cursor-pointer px-3 py-1 hover:bg-border'>Delete</div>
    </div>
  );
}
