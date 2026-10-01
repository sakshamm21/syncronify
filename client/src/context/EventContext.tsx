'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface EventsSyncValue {
  /** Changes whenever an event is created, edited, joined or left. */
  version: number;
  /** Call after any change so every event list and calendar refetches. */
  eventsChanged: () => void;
}

const EventsSyncContext = createContext<EventsSyncValue | null>(null);

/**
 * Keeps the different event views (discovery, calendar, organiser tables)
 * in sync without a global store: they refetch when `version` changes.
 */
export function EventProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const eventsChanged = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(() => ({ version, eventsChanged }), [version, eventsChanged]);
  return <EventsSyncContext.Provider value={value}>{children}</EventsSyncContext.Provider>;
}

export function useEventsSync() {
  const context = useContext(EventsSyncContext);
  if (!context) throw new Error('useEventsSync must be used within an EventProvider');
  return context;
}
