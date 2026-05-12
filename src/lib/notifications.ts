export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title: string, body: string) {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/icon-192.png' });
  } catch {
    // Safari doesn't support Notification constructor in some contexts
  }
}

export function startSimulatedNotifications() {
  const queue = [
    { delay: 10000, title: '🔥 The Council', body: 'Marcus: Mahomes is the greatest QB of this generation, no debate needed.' },
    { delay: 25000, title: '⚔️ New Debate — NFC East Wars', body: 'DeShawn challenged Tre about Cowboys division legacy' },
    { delay: 45000, title: '🤝 Bet Request — The Council', body: 'Tre wants to bet you: Cowboys win the NFC this year' },
    { delay: 60000, title: '💬 NYC Ball 🗽', body: 'Sofia: The Yankees are going to the Series. Mark it.' },
    { delay: 90000, title: '🗳️ Vote needed — The Council', body: 'LeBron vs Jordan debate has 3 votes. Cast yours.' },
  ];
  queue.forEach(({ delay, title, body }) => {
    setTimeout(() => sendNotification(title, body), delay);
  });
}
