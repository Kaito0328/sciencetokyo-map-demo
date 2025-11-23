export type EventRecord = {
  ts: number;
  type: string;
  payload?: Record<string, any>;
};

const _events: EventRecord[] = [];

export const logEvent = (type: string, payload?: Record<string, any>) => {
  _events.push({ ts: Date.now(), type, payload });
};

export const getEvents = () => [..._events];

export const exportEventsJSON = () => {
  const blob = new Blob([JSON.stringify(_events, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'events.json';
  a.click();
  URL.revokeObjectURL(url);
};
