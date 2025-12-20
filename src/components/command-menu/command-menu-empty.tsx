import { cn } from '@/utils/utils';
import { CommandEmpty } from '../ui/command';

interface CommandMenuEmptyProps {
  className?: string;
}

export const CommandMenuEmpty = ({ className }: CommandMenuEmptyProps) => {
  return (
    <CommandEmpty
      className={cn(
        'text-muted-foreground flex items-center justify-center border-b py-6 text-sm',
        className
      )}
    >
      No results found
    </CommandEmpty>
  );
};
