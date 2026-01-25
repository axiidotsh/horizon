import { useState } from 'react';
import { MAX_DURATION, MIN_DURATION } from '../constants';

interface SessionFormValues {
  task: string;
  durationMinutes: string;
}

export function useSessionForm(initialValues?: Partial<SessionFormValues>) {
  const [task, setTask] = useState(initialValues?.task ?? '');
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues?.durationMinutes ?? ''
  );

  function reset() {
    setTask('');
    setDurationMinutes('');
  }

  function getFormData() {
    const duration = parseInt(durationMinutes, 10);
    const isValidDuration =
      !isNaN(duration) && duration >= MIN_DURATION && duration <= MAX_DURATION;

    return {
      task: task.trim() || undefined,
      durationMinutes: isValidDuration ? duration : undefined,
    };
  }

  return {
    task,
    setTask,
    durationMinutes,
    setDurationMinutes,
    reset,
    getFormData,
  };
}
