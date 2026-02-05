'use client';

import { useSettings } from '../../settings/hooks/queries/use-settings';
import { useActiveSession } from '../hooks/queries/use-active-session';
import { useTabTitle } from '../hooks/timer/use-tab-title';
import { useTimerLogic } from '../hooks/timer/use-timer-logic';

const FocusSessionTabTitleEffect = () => {
  const { data: activeSession } = useActiveSession();
  const { remainingSeconds } = useTimerLogic(activeSession);

  const isActive = activeSession?.status === 'ACTIVE';
  const isPaused = activeSession?.status === 'PAUSED';
  const hasActiveSession = isActive || isPaused;

  useTabTitle(remainingSeconds, hasActiveSession);

  return null;
};

export const FocusSessionTabTitle = () => {
  const { data: settings } = useSettings();

  if (!settings?.showFocusTimerInTab) return null;

  return <FocusSessionTabTitleEffect />;
};
