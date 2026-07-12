import { apiFetch } from './client';

type ServiceName = 'auth' | 'comments' | 'ai';

interface HealthResponse {
  services?: Partial<Record<ServiceName, boolean>>;
}

export async function isServiceHealthy(service: ServiceName) {
  try {
    const response = await apiFetch('/health', {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return false;
    const health = (await response.json()) as HealthResponse;
    return health.services?.[service] === true;
  } catch {
    return false;
  }
}
