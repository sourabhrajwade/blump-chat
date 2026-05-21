export function formatMessageTimeFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatThreadTimeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (d >= startOfToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (d >= startOfYesterday) return 'Yesterday';
  const days = Math.floor((startOfToday.getTime() - d.getTime()) / 86400000);
  if (days < 7) {
    return d.toLocaleDateString([], { weekday: 'long' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
