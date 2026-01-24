import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/utils';
import { PRIORITY_OPTIONS } from '../constants';

function getPriorityCircleColor(priority: string) {
  switch (priority) {
    case 'LOW':
      return 'bg-green-500';
    case 'MEDIUM':
      return 'bg-amber-500';
    case 'HIGH':
      return 'bg-red-500';
    case 'NO_PRIORITY':
      return 'bg-muted-foreground/30';
    default:
      return 'bg-muted-foreground/30';
  }
}

interface PriorityOptionProps {
  priority: string;
  label: string;
}

const PriorityOption = ({ priority, label }: PriorityOptionProps) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn('size-2 rounded-full', getPriorityCircleColor(priority))}
      />
      <span>{label}</span>
    </div>
  );
};

interface PrioritySelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const PrioritySelect = ({
  id,
  value,
  onValueChange,
  className,
}: PrioritySelectProps) => {
  const selectedOption = PRIORITY_OPTIONS.find((opt) => opt.value === value);
  const displayOption = selectedOption || PRIORITY_OPTIONS[0];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={cn('w-full', className)}>
        <SelectValue>
          <PriorityOption
            priority={displayOption.value}
            label={displayOption.label}
          />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PRIORITY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <PriorityOption priority={option.value} label={option.label} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
