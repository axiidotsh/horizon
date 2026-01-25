import { useEffect, useRef, useState } from 'react';
import type { FocusSession } from '../types';
import { useEditSession } from './use-edit-session';

export function useSessionTask(activeSession: FocusSession | null | undefined) {
  const updateSession = useEditSession();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSessionIdRef = useRef<string | null>(null);
  const [sessionTask, setSessionTask] = useState(activeSession?.task ?? '');

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleTaskChange = (value: string) => {
    setSessionTask(value);

    if (!activeSession) return;

    if (activeSession.id !== previousSessionIdRef.current) {
      setSessionTask(activeSession.task ?? '');
      previousSessionIdRef.current = activeSession.id;
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      updateSession.mutate({
        param: { id: activeSession.id },
        json: { task: value || undefined },
      });
    }, 500);
  };

  return { sessionTask, handleTaskChange };
}
