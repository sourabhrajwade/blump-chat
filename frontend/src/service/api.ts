import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 8000;

/** Dev machine IP from Expo (works on physical devices with Expo Go). */
function hostFromExpoDebugger(): string | null {
  const raw =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;
  if (!raw) return null;
  const host = raw.split(':')[0]?.trim();
  return host || null;
}

export function resolveApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const devHost = hostFromExpoDebugger();
  if (devHost) return `http://${devHost}:${API_PORT}`;

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

const DEFAULT_BASE = resolveApiBase();

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(joinUrl(DEFAULT_BASE, path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<TBody extends object, TRes>(
  path: string,
  body: TBody,
  init?: RequestInit,
): Promise<TRes> {
  const res = await fetch(joinUrl(DEFAULT_BASE, path), {
    method: 'POST',
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}
