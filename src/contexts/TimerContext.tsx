import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const STUDY_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60;  // 5 minutes in seconds

export type Mode = 'idle' | 'studying' | 'break';

interface TimerContextType {
  /**
   * 残り時間（秒）
   */
  remaining: number;

  /**
   * 経過時間（秒）
   */
  elapsed: number;

  /**
   * 開始時間
   */
  timerStartRef: Date | null;

  /**
   * タイマーのモード
   */
  mode: Mode;

  /**
   * タイマーが動作中かどうか
   */
  isRunning: boolean;

  /**
   * 勉強タイマーの開始処理
   */
  start: () => void;

  /**
   * 勉強タイマーの停止・休憩タイマーの開始処理
   */
  stop: () => void;

  /**
   * 休憩タイマーの停止処理
   */
  reset: () => void;

  /**
   * アラームを鳴らす処理
   */
  playAlarm: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [remaining, setRemaining] = useState<number>(STUDY_DURATION);
  const [mode, setMode] = useState<Mode>('idle');
  const isRunning = mode === 'studying' || mode === 'break';
  const elapsed = useRef<number>(0);
  const timerStartRef = useRef<Date | null>(null);
  const alarmSound = useRef(new Audio('/sounds/notification.mp3'));
  const hasPlayedRef = useRef(false);

  // 初回マウント時にローカルストレージからタイマー状態を取得
  useEffect(() => {
    const savedMode = localStorage.getItem('solodo-timer-mode') as Mode | null;
    const savedStartTime = localStorage.getItem('solodo-timer-start');

    if (savedMode && savedStartTime) {
      setMode(savedMode);
      timerStartRef.current = new Date(savedStartTime);
    }
  }, []);

  // タイマーの状態が変わるたびにローカルストレージを更新
  useEffect(() => {
    if (isRunning && timerStartRef.current) {
      localStorage.setItem('solodo-timer-mode', mode);
      localStorage.setItem('solodo-timer-start', timerStartRef.current.toISOString());
    } else {
      // タイマーがアイドル状態のときはローカルストレージをクリア
      localStorage.removeItem('solodo-timer-mode');
      localStorage.removeItem('solodo-timer-start');
    }
  }, [mode, isRunning]);

  useEffect(() => {
    if (mode === 'studying' || mode === 'break') {
      hasPlayedRef.current = false;
    }
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;

    if (!timerStartRef.current) timerStartRef.current = new Date();
    
    const tick = () => {
      if (!timerStartRef.current) return;
      const now = new Date();
      elapsed.current = (Math.floor((now.getTime() - timerStartRef.current.getTime()) / 1000));
      if (mode === 'studying') {
        setRemaining(STUDY_DURATION - elapsed.current);
      }
      else if (mode === 'break') {
        setRemaining(BREAK_DURATION - elapsed.current);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  useEffect(() => {
    if (remaining <= 0 && !hasPlayedRef.current) {
      console.log('🔔 Playing sound...');
      playAlarm();
      hasPlayedRef.current = true;
    }
    if (remaining <= 0 && mode === 'break') {
      reset();
    }
}, [remaining]);

  const start = () => {
    timerStartRef.current = new Date();
    setRemaining(STUDY_DURATION);
    setMode('studying');
  };

  const stop = () => {
    setMode('break');
    setRemaining(BREAK_DURATION);
    timerStartRef.current = new Date();
  };

  const reset = () => {
    setMode('idle');
    setRemaining(STUDY_DURATION);
    timerStartRef.current = null;
  };

  const playAlarm = () => {
    alarmSound.current.play();
  };

  return (
    <TimerContext.Provider value={{
      remaining,
      elapsed: elapsed.current,
      timerStartRef: timerStartRef.current,
      mode,
      isRunning,
      start,
      stop,
      reset,
      playAlarm
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
};
