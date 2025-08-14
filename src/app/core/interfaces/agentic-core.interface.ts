import { Agent, AgentStatus, AgentWorkflow } from '../../features/agentic-assessment/interfaces/agent.interface';

// Core Agentic Framework Interfaces
export interface AgentConfiguration {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  parameters: AgentParameter[];
  dependencies: AgentDependency[];
  outputs: AgentOutput[];
  lifecycle: AgentLifecycleConfig;
  ui: AgentUIConfig;
  metadata: Record<string, any>;
}

export interface AgentParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface AgentDependency {
  agentId: string;
  agentName: string;
  type: 'required' | 'optional' | 'conditional';
  condition?: string;
  outputMapping?: Record<string, string>;
}

export interface AgentOutput {
  id: string;
  name: string;
  type: string;
  description: string;
  schema?: any;
  format?: 'json' | 'xml' | 'csv' | 'text' | 'binary';
}

export interface AgentLifecycleConfig {
  stages: AgentLifecycleStage[];
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    baseDelay: number;
  };
  rollbackStrategy?: 'none' | 'previous' | 'initial';
}

export interface AgentLifecycleStage {
  id: string;
  name: string;
  description: string;
  order: number;
  required: boolean;
  timeout?: number;
  actions: AgentAction[];
  validations: AgentValidation[];
}

export interface AgentAction {
  id: string;
  name: string;
  type: 'api' | 'computation' | 'validation' | 'transformation';
  config: Record<string, any>;
  async: boolean;
}

export interface AgentValidation {
  id: string;
  name: string;
  type: 'schema' | 'business' | 'security' | 'performance';
  rule: string;
  errorMessage: string;
}

export interface AgentUIConfig {
  icon: string;
  color: string;
  theme: 'light' | 'dark' | 'auto';
  layout: 'card' | 'list' | 'grid' | 'timeline';
  customComponents?: string[];
  displayFields: string[];
  actionButtons: AgentUIAction[];
}

export interface AgentUIAction {
  id: string;
  label: string;
  icon: string;
  type: 'primary' | 'secondary' | 'danger' | 'success';
  action: string;
  condition?: string;
}

// Agent Registry and Management
export interface AgentRegistry {
  agents: Map<string, AgentConfiguration>;
  categories: AgentCategory[];
  workflows: AgentWorkflow[];
  templates: AgentTemplate[];
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  agentCount: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configuration: Partial<AgentConfiguration>;
  isPublic: boolean;
  author: string;
  version: string;
  tags: string[];
}

// User Agent Management
export interface UserAgentPreferences {
  userId: string;
  pinnedAgents: string[];
  favoriteAgents: string[];
  recentAgents: string[];
  customCategories: AgentCategory[];
  notifications: AgentNotificationSettings;
}

export interface AgentNotificationSettings {
  enabled: boolean;
  types: ('status' | 'completion' | 'error' | 'dependency')[];
  channels: ('ui' | 'email' | 'webhook')[];
  frequency: 'immediate' | 'batched' | 'daily';
}

// Agent Execution Context
export interface AgentExecutionContext {
  id: string;
  agentId: string;
  workflowId?: string;
  userId: string;
  environment: 'development' | 'staging' | 'production';
  parameters: Record<string, any>;
  dependencies: AgentExecutionDependency[];
  startTime: Date;
  endTime?: Date;
  status: AgentStatus;
  progress: number;
  logs: AgentExecutionLog[];
  metrics: AgentExecutionMetrics;
  outputs: Record<string, any>;
  executionState: {
    isPaused: boolean;
    isCancelled: boolean;
    lastUpdated: Date;
  };
}

export interface AgentExecutionDependency {
  agentId: string;
  executionId: string;
  status: AgentStatus;
  outputs: Record<string, any>;
}

export interface AgentExecutionLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  stage: string;
  message: string;
  data?: any;
}

export interface AgentExecutionMetrics {
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  networkCalls: number;
  errorCount: number;
  warningCount: number;
}

// Navigation and UI State
export interface AgentNavigationState {
  currentView: 'hub' | 'my-agents' | 'pinned' | 'progress' | 'detail' | 'workflow';
  selectedAgentId?: string;
  selectedWorkflowId?: string;
  filters: AgentFilters;
  searchQuery: string;
  sortBy: 'name' | 'status' | 'lastActivity' | 'priority' | 'category';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'timeline';
}

export interface AgentFilters {
  categories: string[];
  statuses: AgentStatus[];
  priorities: string[];
  tags: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}
