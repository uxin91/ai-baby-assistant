import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const saved = await AsyncStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch {
    // ignore
  }
  return defaultValue;
}

export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function getAgeInMonths(birthday: string): number {
  const birth = new Date(birthday);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export function getAgeText(birthday: string): string {
  const months = getAgeInMonths(birthday);
  if (months < 1) return '不到1个月';
  if (months < 12) return `${months}个月`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years}岁`;
  return `${years}岁${remainingMonths}个月`;
}
