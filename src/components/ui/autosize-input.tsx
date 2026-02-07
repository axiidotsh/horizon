import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { cn } from '@/utils/utils';

interface AutosizeInputProps
  extends Omit<React.ComponentProps<typeof TextareaAutosize>, 'className'> {
  className?: string;
}

const AutosizeInput = React.forwardRef<HTMLTextAreaElement, AutosizeInputProps>(
  ({ className, maxRows = 4, ...props }, ref) => {
    return (
      <TextareaAutosize
        ref={ref}
        maxRows={maxRows}
        data-slot="autosize-input"
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-9 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...props}
      />
    );
  }
);

AutosizeInput.displayName = 'AutosizeInput';

export { AutosizeInput };
