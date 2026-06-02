import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '-- Chọn --',
  required,
  className = '',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-3 py-2.5 text-xs font-medium font-vietnam text-left transition-all focus:outline-none focus:ring-1 focus:ring-[#8fae8d] ${
          open
            ? 'border-[#8fae8d] ring-1 ring-[#8fae8d]'
            : 'border-zinc-100 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={selectedOption ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          value={value}
          required={required}
          onChange={() => {}}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-scale-up origin-top">
          <div className="max-h-52 overflow-y-auto py-1.5">
            {/* Placeholder option */}
            {placeholder && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-vietnam text-left transition-colors ${
                  value === ''
                    ? 'bg-[#8fae8d]/10 text-[#6f8d6d] dark:text-[#8fae8d] font-semibold'
                    : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex-1">{placeholder}</span>
              </button>
            )}

            {/* Options */}
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-vietnam text-left transition-colors ${
                  value === opt.value
                    ? 'bg-[#8fae8d]/10 text-[#6f8d6d] dark:text-[#8fae8d] font-semibold'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex-1">{opt.label}</span>
                {value === opt.value && <Check size={12} className="shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
