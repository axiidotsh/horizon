import { SearchIcon } from 'lucide-react';
import { Input } from './ui/input';

export const AppHeader = () => {
  return (
    <div className="bg-sidebar flex h-16 items-center border-b px-4">
      <SearchIcon className="text-muted-foreground size-4" />
      <Input
        className="border-none bg-none shadow-none ring-0! outline-0!"
        placeholder="Search for items..."
      />
    </div>
  );
};
