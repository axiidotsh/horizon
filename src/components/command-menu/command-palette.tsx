import { CommandGroups } from '@/components/command-menu/command-groups';
import type { CommandMenuItem } from '@/components/command-menu/types';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { CommandMenuEmpty } from './command-menu-empty';

interface CommandPaletteProps {
  commands: CommandDefinition[];
  todos: CommandMenuItem[];
  habits: CommandMenuItem[];
  sessions: CommandMenuItem[];
  onCommandSelect: (command: CommandDefinition) => void;
  onItemSelect: (item: CommandMenuItem) => void;
}

export const CommandPalette = ({
  commands,
  todos,
  habits,
  sessions,
  onCommandSelect,
  onItemSelect,
}: CommandPaletteProps) => {
  return (
    <>
      <CommandMenuEmpty className="border-0" />
      <CommandGroups
        commands={commands}
        todos={todos}
        habits={habits}
        sessions={sessions}
        onCommandSelect={onCommandSelect}
        onItemSelect={onItemSelect}
      />
    </>
  );
};
