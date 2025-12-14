import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusSession } from '../types';
import { useUpdateSession } from './use-update-session';

export function useSessionTask(activeSession: FocusSession | null | undefined) {
  const [sessionTask, setSessionTask] = useState('');
  const updateSession = useUpdateSession();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeSession?.task !== undefined) {
      setSessionTask(activeSession.task || '');
    } else if (!activeSession) {
      setSessionTask('');
    }
  }, [activeSession?.task, activeSession]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const debouncedUpdateTask = useCallback(
    (task: string) => {
      if (!activeSession) return;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        updateSession.mutate({
          param: { id: activeSession.id },
          json: { task: task || undefined },
        });
      }, 500);
    },
    [activeSession, updateSession]
  );

  const handleTaskChange = (value: string) => {
    setSessionTask(value);
    if (activeSession) {
      debouncedUpdateTask(value);
    }
  };

  return { sessionTask, handleTaskChange };
}
