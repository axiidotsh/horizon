import { Button } from '@/components/ui/button';
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react';

interface TimerControlsProps {
  state: 'idle' | 'active' | 'paused' | 'completed';
  handlers: {
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onComplete: () => void;
    onEndEarly: () => void;
    onCancel: () => void;
    onDiscard: () => void;
    onReset: () => void;
  };
  isPending: {
    start: boolean;
    pause: boolean;
    resume: boolean;
    complete: boolean;
  };
}

export const TimerControls = ({
  state,
  handlers,
  isPending,
}: TimerControlsProps) => {
  if (state === 'completed') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlers.onComplete}
            disabled={isPending.complete}
            className="w-28"
          >
            <CheckIcon />
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handlers.onDiscard}
            className="w-28"
          >
            <XIcon />
            Discard
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'idle') {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="icon-lg"
          variant="ghost"
          tooltip="Start session"
          onClick={handlers.onStart}
          disabled={isPending.start}
        >
          <PlayIcon />
        </Button>
        <Button
          size="icon-lg"
          variant="ghost"
          tooltip="Reset"
          onClick={handlers.onReset}
        >
          <RotateCcwIcon />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon-lg"
        variant="ghost"
        tooltip="End session early"
        className="rounded-full"
        onClick={handlers.onEndEarly}
      >
        <SquareIcon />
      </Button>
      <Button
        size="icon"
        className="size-12 rounded-full"
        tooltip={state === 'paused' ? 'Resume' : 'Pause'}
        onClick={state === 'paused' ? handlers.onResume : handlers.onPause}
        disabled={isPending.pause || isPending.resume}
      >
        {state === 'paused' ? <PlayIcon /> : <PauseIcon />}
      </Button>
      <Button
        size="icon-lg"
        variant="ghost"
        tooltip="Cancel session"
        className="rounded-full"
        onClick={handlers.onCancel}
      >
        <XIcon />
      </Button>
    </div>
  );
};
