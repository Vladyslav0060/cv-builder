export function optionalEnv(key: string): string | undefined {
  return process.env[key];
}

export function requiredEnv(key: string): string {
  const value = optionalEnv(key);

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

export function numberEnv(key: string, fallback: number): number {
  const value = optionalEnv(key);

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric env var: ${key}`);
  }

  return parsed;
}

export function booleanEnv(key: string, fallback = false): boolean {
  const value = optionalEnv(key);

  if (!value) {
    return fallback;
  }

  return value === 'true';
}
