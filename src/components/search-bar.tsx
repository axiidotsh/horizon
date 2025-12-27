'use client';

import { cn } from '@/utils/utils';
import { SearchIcon } from 'lucide-react';
import { forwardRef, InputHTMLAttributes } from 'react';

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  iconClassName?: string;
  inputClassName?: string;
  expandOnFocus?: boolean;
  maxWidth?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      iconClassName,
      inputClassName,
      expandOnFocus = false,
      maxWidth,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'relative w-full! max-w-none! overflow-hidden rounded-md',
          className
        )}
      >
        <SearchIcon
          className={cn(
            'text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2',
            iconClassName
          )}
        />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={cn(
            'placeholder:text-muted-foreground h-8 w-full max-w-none! rounded-md border-0 bg-transparent pr-3 pl-8 text-sm shadow-none ring-0 transition-all outline-none',
            expandOnFocus && 'focus:bg-accent/50',
            expandOnFocus && maxWidth && `focus:${maxWidth}`,
            inputClassName
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
