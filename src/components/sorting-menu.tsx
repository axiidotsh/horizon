import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { CheckIcon } from 'lucide-react';

type SortOrder = 'asc' | 'desc';

interface OptionProps {
  label: string;
  order: SortOrder;
}

interface SortingMenuProps<T extends string> {
  title: string;
  sortKey: T;
  currentSortBy: T;
  currentSortOrder: SortOrder;
  options: OptionProps[];
  onChange: (sortBy: T, order: SortOrder) => void;
}

export const SortingMenu = <T extends string>({
  title,
  sortKey,
  currentSortBy,
  currentSortOrder,
  options,
  onChange,
}: SortingMenuProps<T>) => {
  const isParentChecked = currentSortBy === sortKey;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <CheckIcon
          className={cn('shrink-0 opacity-0', isParentChecked && 'opacity-100')}
        />
        {title}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {options.map(({ label, order }) => {
          return (
            <DropdownMenuCheckboxItem
              key={order}
              checked={currentSortBy === sortKey && currentSortOrder === order}
              onCheckedChange={() => onChange(sortKey, order)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
