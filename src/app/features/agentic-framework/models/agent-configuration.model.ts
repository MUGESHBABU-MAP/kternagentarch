export interface AgentConfiguration {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'error' | 'pending';
  pinned?: boolean;
  icon?: string;
  lastRun?: Date | string;
  lastHeartbeat?: Date | string;
  priority?: 'low' | 'medium' | 'high';
  uiConfig?: {
    icon: string;
    color: string;
  };
  capabilities?: string[];
  metrics?: {
    successRate: number;
    avgExecutionTime: string;
    totalRuns: number;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
  version?: string;
}
