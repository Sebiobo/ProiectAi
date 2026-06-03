const BASE_URL = 'http://127.0.0.1:8000';

export async function registerUser(data: {
  email: string;
  full_name: string;
  password: string;
}) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Eroare la înregistrare.');
  }
  return res.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Credențiale invalide.');
  }
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}
