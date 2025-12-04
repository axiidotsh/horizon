import { CommandMenu } from './command-menu';
import { FocusTimerWidget } from './focus-timer-widget';

export const AppHeader = () => {
  return (
    <div className="bg-sidebar/30 sticky top-0 z-10 flex h-16 items-center border-b px-4 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
        <CommandMenu />
        <FocusTimerWidget />
      </div>
    </div>
  );
};
