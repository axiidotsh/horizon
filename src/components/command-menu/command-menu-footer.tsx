import { CommandSeparator } from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';

export const CommandMenuFooter = () => {
  return (
    <>
      <CommandSeparator className="mx-0 mt-auto w-full" />
      <div className="text-muted-foreground flex h-9 shrink-0 items-center justify-center gap-2 px-2 text-xs">
        <span>Press</span>
        <Kbd>Esc</Kbd>
        <span>to go back</span>
      </div>
    </>
  );
};
