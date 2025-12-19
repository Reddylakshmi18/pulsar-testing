
export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
  PENDING = 'pending'
}

export interface HeartbeatData {
  timestamp: number;
  latency: number;
  status: ServiceStatus;
}

export interface Service {
  id: string;
  name: string;
  url: string;
  status: ServiceStatus;
  lastCheck: number;
  history: HeartbeatData[];
  type: 'api' | 'database' | 'cdn' | 'microservice';
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  anomaliesFound: boolean;
}
