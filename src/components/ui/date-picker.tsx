'use client';

import { parseDate } from 'chrono-node';
import { addDays, format, nextMonday } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/utils';

function formatDateLong(date: Date | undefined) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const DATE_SHORTCUTS = [
  { label: 'Today', getDate: () => new Date() },
  { label: 'Tomorrow', getDate: () => addDays(new Date(), 1) },
  { label: 'In 3 days', getDate: () => addDays(new Date(), 3) },
  { label: 'Next Monday', getDate: () => nextMonday(new Date()) },
];

interface DatePickerBaseProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  contentClassName?: string;
}

interface DefaultDatePickerProps extends DatePickerBaseProps {
  mode?: 'default';
  triggerClassName?: string;
}

interface NaturalLanguageDatePickerProps extends DatePickerBaseProps {
  mode: 'natural-language';
  placeholder?: string;
  inputClassName?: string;
}

type DatePickerProps = DefaultDatePickerProps | NaturalLanguageDatePickerProps;

export function DatePicker(props: DatePickerProps) {
  const { date, setDate, contentClassName } = props;

  if (props.mode === 'natural-language') {
    return (
      <NaturalLanguageDatePicker
        date={date}
        setDate={setDate}
        placeholder={props.placeholder}
        inputClassName={props.inputClassName}
        contentClassName={contentClassName}
      />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            'data-[empty=true]:text-muted-foreground justify-start text-left font-normal',
            props.triggerClassName
          )}
        >
          <CalendarIcon />
          <span className="truncate">
            {date ? format(date, 'PPP') : 'Pick a date'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', contentClassName)}>
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}

interface NaturalLanguageInternalProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  inputClassName?: string;
  contentClassName?: string;
}

const NaturalLanguageDatePicker = ({
  date,
  setDate,
  placeholder = 'Tomorrow or next week',
  inputClassName,
  contentClassName,
}: NaturalLanguageInternalProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(date ? formatDateLong(date) : '');

  return (
    <InputGroup className={inputClassName}>
      <InputGroupInput
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          if (!newValue.trim()) {
            setDate(undefined);
            return;
          }
          const parsed = parseDate(newValue);
          if (parsed) {
            setDate(parsed);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Select date"
            >
              <CalendarIcon />
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className={cn('w-auto overflow-hidden p-0', contentClassName)}
            align="end"
            sideOffset={8}
          >
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              onSelect={(selected) => {
                setDate(selected);
                setValue(formatDateLong(selected));
                setOpen(false);
              }}
            />
            <div className="border-t p-2">
              <div className="grid grid-cols-2 gap-1">
                {DATE_SHORTCUTS.map(({ label, getDate }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className="rounded-sm text-xs"
                    onClick={() => {
                      const d = getDate();
                      setDate(d);
                      setValue(formatDateLong(d));
                      setOpen(false);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
};
