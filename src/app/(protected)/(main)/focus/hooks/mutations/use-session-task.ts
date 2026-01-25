import { useEffect, useRef, useState } from 'react';
import type { FocusSession } from '../types';
import { useEditSession } from './use-edit-session';

export function useSessionTask(activeSession: FocusSession | null | undefined) {
  const updateSession = useEditSession();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionTask, setSessionTask] = useState(activeSession?.task ?? '');
  const [prevSessionId, setPrevSessionId] = useState(activeSession?.id);

  if (activeSession?.id !== prevSessionId) {
    setPrevSessionId(activeSession?.id);
    setSessionTask(activeSession?.task ?? '');
  }

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
