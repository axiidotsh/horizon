import { formatTime } from '@/utils/timer';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_TITLE = 'Horizon';

export function useTabTitle(
  remainingSeconds: number,
  hasActiveSession: boolean
) {
  const originalTitleRef = useRef<string>(DEFAULT_TITLE);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    originalTitleRef.current = document.title;
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsHidden(document.hidden);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    setIsHidden(document.hidden);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!hasActiveSession || !isHidden) {
      document.title = originalTitleRef.current;
      return;
    }

    const timeDisplay = formatTime(remainingSeconds);
    document.title = `${timeDisplay} - ${originalTitleRef.current}`;
  }, [remainingSeconds, hasActiveSession, isHidden]);
}
