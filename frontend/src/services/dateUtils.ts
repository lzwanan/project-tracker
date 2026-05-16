export function countdownLabel(dateStr?: string): { text: string; color: string } {
  if (!dateStr) return { text: '-', color: '#94a3b8' };
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: `已超期 ${Math.abs(diff)} 天`, color: '#ef4444' };
  if (diff === 0) return { text: '今天截止', color: '#f59e0b' };
  return { text: `剩余 ${diff} 天`, color: '#10b981' };
}
