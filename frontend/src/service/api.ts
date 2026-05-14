const DEFAULT_BASE =
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : 'http://localhost:8080';

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
