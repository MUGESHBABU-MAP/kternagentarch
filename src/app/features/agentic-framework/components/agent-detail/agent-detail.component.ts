import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentManagerService } from '../../../../core/services/agent-manager.service';
import { 
  AgentConfiguration, 
  AgentParameter, 
  AgentDependency, 
  AgentOutput, 
  AgentLifecycleConfig, 
  AgentUIConfig,
  AgentExecutionContext
} from '../../../../core/interfaces/agentic-core.interface';
import { AgentStatus } from '../../../agentic-assessment/interfaces/agent.interface';

// Agent interface that combines AgentConfiguration with UI-specific properties
export interface Agent {
  // Required properties
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'error' | 'pending';
  
  // UI-specific configuration
  uiConfig: {
    icon: string;
    color: string;
  };
  
  // Metrics with default values
  metrics: {
    successRate: number;
    avgExecutionTime: string;
    totalRuns: number;
  };
  
  // Optional properties
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  capabilities?: string[];
  version?: string;
  
  // UI state
  pinned?: boolean;
  
  // Date fields
  lastRun?: Date;
  lastHeartbeat?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Allow any other properties from AgentConfiguration
  [key: string]: any;
}

interface ExecutionLog {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'error';
  startTime: Date;
  endTime?: Date;
  duration: string;
  error?: string;
  progress?: number;
  logs?: Array<{
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }>;
}

@Component({
  selector: 'app-agent-detail',
  templateUrl: './agent-detail.component.html',
  styleUrls: ['./agent-detail.component.scss']
})
export class AgentDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  agent: Agent | null = null;
  loading = true;
  executing = false;
  executions: ExecutionLog[] = [];
  dependencies: Agent[] = [];
  dependents: Agent[] = [];
  relatedAgents: Agent[] = [];
  executionLogs: Array<{
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    level: 'info' | 'success' | 'error' | 'warning';
  }> = [];
  timestamp: string = '';
  message: string = '';
  type: 'info' | 'success' | 'error' | 'warning' = 'info';
  level: 'info' | 'success' | 'error' | 'warning' = 'info';
  
  // Tab management
  viewModes = ['overview', 'executions', 'configuration', 'logs'];
  activeTab = 'overview';
  activeTabIndex = 0;
  isConfigFormVisible = false;
  
  // Type guard to check if agent is defined
  private get safeAgent(): Agent {
    if (!this.agent) {
      throw new Error('Agent is not defined');
    }
    return this.agent;
  }
  
  // TrackBy functions for ngFor - Single implementation of each
  trackByAgent(_index: number, agent: Agent): string {
    return agent.id;
  }
  
  trackByExecution(_index: number, execution: ExecutionLog): string {
    return execution.id;
  }
  
  // Default UI config for agents
  private defaultUiConfig = {
    icon: 'tool',
    color: '#1890ff'
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agentManager: AgentManagerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize tab from URL first
    this.initTabFromRoute();
    
    // Then load agent details
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (params) => {
        const agentId = params['id'];
        if (agentId) {
          this.loadAgentDetails(agentId);
        } else {
          this.loading = false;
          this.router.navigate(['/agents/hub']);
        }
      },
      error: (error) => {
        console.error('Error loading agent:', error);
        this.loading = false;
        this.router.navigate(['/agents/hub']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper methods for template expressions (Angular 8 compatibility)
  getCompletedExecutionsCount(): number {
    return this.executions.filter(e => e.status === 'completed').length;
  }

  getFailedExecutionsCount(): number {
    return this.executions.filter(e => e.status === 'failed').length;
  }

  getRunningExecutionsCount(): number {
    return this.executions.filter(e => e.status === 'running').length;
  }

  private loadAgentDetails(agentId: string): void {
    try {
      this.loading = true;
      const agentConfig = this.agentManager.getAgent(agentId);
      
      if (agentConfig) {
        // Convert the agent configuration to the full Agent type
        this.agent = this.convertToAgent(agentConfig);
        this.loadRelatedAgents(this.agent);
        this.loadExecutionHistory(agentId);
      } else {
        console.warn(`Agent with ID ${agentId} not found`);
        // Create a minimal valid Agent object with all required properties
        this.agent = {
          id: agentId,
          name: 'Unknown Agent',
          type: 'Unknown',
          status: 'error',
          description: 'Agent not found',
          uiConfig: { ...this.defaultUiConfig, color: '#f5222d' },
          metrics: {
            successRate: 0,
            avgExecutionTime: '0s',
            totalRuns: 0
          },
          capabilities: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '0.0.0',
          priority: 'medium'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error loading agent details:', error);
      this.addLog(`Failed to load agent details: ${errorMessage}`, 'error');
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private convertToAgent(config: AgentConfiguration | any): Agent {
    const now = new Date();
    
    // Create a base config with all required properties
    const baseAgent: Agent = {
      // Required properties with defaults
      id: config.id || `agent-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'Unnamed Agent',
      type: config.type || 'Custom',
      status: (config.status || 'idle') as 'idle' | 'running' | 'completed' | 'failed' | 'error' | 'pending',
      
      // UI Config with defaults
      uiConfig: {
        ...this.defaultUiConfig,
        ...(config.uiConfig || {})
      },
      
      // Metrics with defaults
      metrics: {
        successRate: (config.metrics && config.metrics.successRate) || 0,
        avgExecutionTime: (config.metrics && config.metrics.avgExecutionTime) || '0s',
        totalRuns: (config.metrics && config.metrics.totalRuns) || 0,
      },
      
      // Optional properties with defaults
      description: config.description || 'No description provided',
      category: config.category || 'General',
      priority: (config.priority || 'medium') as 'low' | 'medium' | 'high',
      capabilities: Array.isArray(config.capabilities) ? config.capabilities : [],
      version: config.version || '1.0.0',
      pinned: Boolean(config.pinned),
      
      // Handle date conversions
      lastRun: config.lastRun ? new Date(config.lastRun) : undefined,
      lastHeartbeat: config.lastHeartbeat ? new Date(config.lastHeartbeat) : now,
      createdAt: config.createdAt ? new Date(config.createdAt) : now,
      updatedAt: config.updatedAt ? new Date(config.updatedAt) : now,
      
      // Copy any additional properties from the config
      ...Object.fromEntries(
        Object.entries(config).filter(
          ([key]) => !['id', 'name', 'type', 'status', 'uiConfig', 'metrics', 
                      'description', 'category', 'priority', 'capabilities', 
                      'version', 'pinned', 'lastRun', 'lastHeartbeat', 
                      'createdAt', 'updatedAt'].includes(key)
        )
      )
    };
    
    return baseAgent;
  }

  private loadRelatedAgents(agent: Agent): void {
    try {
      this.relatedAgents = [];
      this.dependencies = [];
      
      const allAgents = this.agentManager.getAllAgents() || [];
      
      // Find agents in the same category
      this.relatedAgents = allAgents
        .filter((a: any) => a && a.id !== agent.id && a.category === agent.category)
        .map((agentConfig: any) => this.convertToAgent(agentConfig));
      
      // For demo purposes, use recent agents as dependencies
      const recentAgents = this.agentManager.getRecentAgents ? 
        this.agentManager.getRecentAgents() : [];
      
      if (Array.isArray(recentAgents)) {
        this.dependencies = (recentAgents as any[])
          .slice(0, 3)
          .map(agentConfig => this.convertToAgent(agentConfig));
      } else if (recentAgents && typeof (recentAgents as any).subscribe === 'function') {
        (recentAgents as any).pipe(takeUntil(this.destroy$)).subscribe({
          next: (agents: any[]) => {
            this.dependencies = (agents || [])
              .slice(0, 3)
              .map(agentConfig => this.convertToAgent(agentConfig));
            this.cdr.markForCheck();
          },
          error: (error: any) => {
            console.error('Error loading recent agents:', error);
            this.dependencies = [];
            this.cdr.markForCheck();
          }
        });
      }
    } catch (error) {
      console.error('Error loading related agents:', error);
      this.relatedAgents = [];
      this.dependencies = [];
    } finally {
      this.cdr.markForCheck();
    }
  }

  private loadExecutionHistory(agentId: string): void {
    try {
      // Simulate execution history since it's not directly available in the service
      this.executions = [
        { 
          id: 'exec-1', 
          status: 'completed', 
          startTime: new Date(Date.now() - 3600000), 
          duration: '2.1s' 
        },
        { 
          id: 'exec-2', 
          status: 'completed', 
          startTime: new Date(Date.now() - 86400000), 
          duration: '1.8s' 
        },
        { 
          id: 'exec-3', 
          status: 'failed', 
          startTime: new Date(Date.now() - 172800000), 
          duration: '0.5s', 
          error: 'Connection timeout' 
        }
      ];
    } catch (error) {
      console.error('Error loading execution history:', error);
      this.executions = [];
    } finally {
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle the Run Agent button click
   */
  onRunAgent(): void {
    if (this.executing) {
      this.addLog('Agent is already running', 'warning');
      return;
    }

    if (!this.agent) {
      this.addLog('No agent selected', 'error');
      return;
    }

    this.addLog(`Starting execution of ${this.agent.name}...`, 'info');
    this.executeAgent();
  }

  onPinAgent(): void {
    if (this.agent) {
      if (this.isAgentPinned()) {
        this.agentManager.unpinAgent(this.agent.id);
      } else {
        this.agentManager.pinAgent(this.agent.id);
      }
      this.cdr.markForCheck();
    }
  }

  isAgentPinned(): boolean {
    if (!this.agent) return false;
    try {
      const userPrefsSubject = this.agentManager['userPreferencesSubject'];
      const prefs = userPrefsSubject && userPrefsSubject.value;
      if (!prefs || !Array.isArray(prefs.pinnedAgents)) {
        return false;
      }
      return prefs.pinnedAgents.includes(this.agent.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error checking if agent is pinned:', errorMessage);
      return false;
    }
  }

  /**
   * Execute the agent and handle the execution flow
   */
  executeAgent(): void {
    try {
      if (!this.agent) {
        throw new Error('No agent selected');
      }
      
      // Reset execution state
      this.executing = true;
      this.executionLogs = [];
      this.addLog('Initializing agent execution...', 'info');
      
      // Update agent status
      this.agent = {
        ...this.agent,
        status: 'running',
        lastRun: new Date()
      };
      
          // Create a new execution context
      const executionContext: AgentExecutionContext = {
        id: `exec-${Date.now()}`,
        agentId: this.agent.id,
        userId: 'current-user', // TODO: Replace with actual user ID
        environment: 'development', // TODO: Get from environment
        parameters: {},
        dependencies: [],
        startTime: new Date(),
        status: AgentStatus.RUNNING,
        progress: 0,
        logs: [],
        metrics: {
          duration: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkCalls: 0,
          errorCount: 0,
          warningCount: 0
        },
        outputs: {},
        executionState: {
          isPaused: false,
          isCancelled: false,
          lastUpdated: new Date()
        }
      };
      
      // Add to active executions
      const currentExecutions = this.agentManager['activeExecutionsSubject'].value;
      this.agentManager['activeExecutionsSubject'].next([...currentExecutions, executionContext]);
      
      // Generate a unique execution ID
      const executionId = `exec-${Date.now()}`;
      
      // Add initial execution log
      this.addLog(`Starting execution ${executionId}...`, 'info');
      
      // Create a new execution record
      const newExecution: ExecutionLog = {
        id: executionId,
        status: 'running',
        startTime: new Date(),
        duration: '0s',
        progress: 0
      };
      
      // Add to execution history
      this.executions = [newExecution, ...this.executions];
      this.cdr.markForCheck();
      
      // Start monitoring the execution
      this.monitorExecution(executionId);
      
      // Simulate agent execution
      setTimeout(() => {
        // This would be replaced with actual agent execution logic
        this.addLog('Agent execution in progress...', 'info');
      }, 1000);
      
    } catch (error) {
      console.error('Error executing agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.addLog(`Error: ${errorMessage}`, 'error');
      
      // Update agent status on error
      if (this.agent) {
// Update agent status to failed
        this.agent = { ...this.agent, status: AgentStatus.FAILED };
        
        // Update execution status if it exists
        const currentExecutions = this.agentManager['activeExecutionsSubject'].value || [];
        const executionIndex = this.agent ? currentExecutions.findIndex(exec => 
          exec.agentId === this.agent!.id && exec.status === AgentStatus.RUNNING
        ) : -1;
        
        if (executionIndex !== -1 && this.agent) {
          const updatedExecutions = [...currentExecutions];
          const now = new Date();
          
          updatedExecutions[executionIndex] = {
            ...updatedExecutions[executionIndex],
            status: AgentStatus.FAILED,
            endTime: now,
            progress: 100,
            logs: [
              ...(updatedExecutions[executionIndex].logs || []),
              {
                id: `log-${Date.now()}`,
                timestamp: now,
                level: 'error' as const,
                stage: 'execution',
                message: errorMessage,
                data: { error: errorMessage }
              }
            ],
            metrics: {
              ...updatedExecutions[executionIndex].metrics,
              errorCount: (updatedExecutions[executionIndex].metrics.errorCount || 0) + 1,
              duration: now.getTime() - updatedExecutions[executionIndex].startTime.getTime()
            },
            executionState: {
              ...updatedExecutions[executionIndex].executionState,
              lastUpdated: now
            }
          };
          
          this.agentManager['activeExecutionsSubject'].next(updatedExecutions);
        }
      }
      
      this.executing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Add a log message to the execution log
   */
  private addLog(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = { timestamp, message, type, level: type };
      
      // Create a new array reference to trigger change detection
      this.executionLogs = [logEntry, ...this.executionLogs.slice(0, 99)]; // Keep last 100 entries
      
      // Auto-scroll to bottom of log container
      setTimeout(() => {
        const logContainer = document.querySelector('.execution-logs');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      }, 100);
      
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error adding log entry:', error);
    }
  }

  /**
   * Monitor the execution of an agent
   */
  private monitorExecution(executionId: string): void {
    try {
      if (!this.agent) {
        throw new Error('No agent loaded');
      }

      // Update agent status to running
      this.agent = {
        ...this.agent,
        status: 'running',
        lastRun: new Date()
      };
      this.executing = true;
      this.cdr.markForCheck();

      // Simulate execution progress
      let progress = 0;
      const totalSteps = 10;
      const updateInterval = 1000; // Update every second
      
      const updateProgress = () => {
        try {
          if (progress >= totalSteps) {
            // Execution completed successfully
            if (this.agent) {
              this.agent = {
                ...this.agent,
                status: 'completed',
                lastRun: new Date()
              };
              
              // Update metrics
              const metrics = this.agent.metrics || { successRate: 0, avgExecutionTime: '0s', totalRuns: 0 };
              const totalRuns = (metrics.totalRuns || 0) + 1;
              
              this.agent.metrics = {
                ...metrics,
                totalRuns: totalRuns,
                successRate: ((metrics.successRate || 0) * (metrics.totalRuns || 0) + 1) / totalRuns,
                avgExecutionTime: '5.2s' // Example value
              };
              
              this.addLog('Execution completed successfully', 'success');
              
              // Add to execution history
              this.executions = [{
                id: `exec-${Date.now()}`,
                status: 'completed',
                startTime: new Date(),
                duration: '5.2s'
              }, ...this.executions];
              
              // Navigate to results page after a short delay
              setTimeout(() => {
                if (this.agent && this.agent.id) {
                  this.router.navigate(['/agents/agent', this.agent.id, 'results']);
                }
              }, 1000);
            }
            
            this.executing = false;
            this.cdr.markForCheck();
            return;
          }
          
          // Update progress
          progress++;
          const progressPercent = Math.round((progress / totalSteps) * 100);
          this.addLog(`Execution in progress: ${progressPercent}%`);
          
          // Update agent status
          if (this.agent) {
            this.agent = {
              ...this.agent,
              status: 'running',
              metrics: {
                ...(this.agent.metrics || {}),
                avgExecutionTime: `${(progress * 0.5).toFixed(1)}s`
              }
            };
          }
          
          // Schedule next update if still running
          if (this.executing) {
            setTimeout(updateProgress, updateInterval);
          }
        } catch (error) {
          this.handleExecutionError(error);
        }
      };
      
      // Start the execution
      this.addLog('Starting execution...', 'info');
      setTimeout(updateProgress, 500);
    } catch (error) {
      this.handleExecutionError(error);
    }
  }
  
  /**
   * Handle execution errors
   */
  private handleExecutionError(error: any): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during execution';
    this.addLog(`Execution error: ${errorMessage}`, 'error');
    
    if (this.agent) {
      this.agent = {
        ...this.agent,
        status: 'failed',
        lastRun: new Date()
      };
      
      // Add failed execution to history
      this.executions = [{
        id: `exec-${Date.now()}`,
        status: 'failed',
        startTime: new Date(),
        duration: '0s',
        error: errorMessage
      }, ...this.executions];
    }
    
    this.executing = false;
    this.cdr.markForCheck();
  }
  
  
  getStatusIcon(status: string | undefined): string {
    if (!status) return 'question-circle';
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case 'running': return 'sync';
      case 'completed': return 'check-circle';
      case 'failed': 
      case 'error': return 'close-circle';
      case 'pending': return 'clock-circle';
      case 'idle': return 'pause-circle';
      default: return 'question-circle';
    }
  }

  onTabChange(index: number): void {
    if (index >= 0 && index < this.viewModes.length) {
      this.activeTab = this.viewModes[index];
      this.activeTabIndex = index;
      // Update URL to reflect the current tab
      if (this.agent) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tab: this.activeTab },
          queryParamsHandling: 'merge'
        });
      }
    }
  }

  // Initialize tab from URL
  private initTabFromRoute(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const tab = params['tab'];
      if (tab && this.viewModes.includes(tab)) {
        this.activeTab = tab;
        this.activeTabIndex = this.viewModes.indexOf(tab);
      }
    });
  }
  
  // Navigation and action methods
  onNavigateToAgent(agentId: string): void {
    this.router.navigate(['/agents', agentId]);
  }

  onNavigateToExecution(executionId: string): void {
    if (!this.agent) return;
    // Navigate to the results page with the execution ID
    this.router.navigate(['/agents', this.agent.id, 'results'], {
      queryParams: { executionId: executionId }
    });
  }

  onConfigureAgent(): void {
    this.activeTabIndex = 1; // Switch to configuration tab
  }

  onEditConfiguration(): void {
    this.activeTabIndex = 1; // Switch to configuration tab
  }

  onSaveConfiguration(): void {
    // Implementation for saving configuration
    this.addLog('Configuration saved successfully', 'success');
  }

  onCancelConfiguration(): void {
    this.activeTabIndex = 0; // Switch back to overview tab
  }

  onCloneAgent(): void {
    if (!this.agent) return;
    
    // Get the current agent's config from the manager
    const currentConfig = this.agentManager.getAgent(this.agent.id);
    if (!currentConfig) {
      this.addLog('Error: Could not find agent configuration', 'error');
      return;
    }
    
    // Create a new agent configuration based on the current agent
    const newAgentConfig: AgentConfiguration = {
      ...currentConfig,
      id: `agent-${Math.random().toString(36).substr(2, 9)}`,
      name: `${currentConfig.name} (Copy)`,
      version: '1.0.0',
      metadata: {
        ...(currentConfig.metadata || {}),
        clonedFrom: currentConfig.id,
        clonedAt: new Date().toISOString()
      }
    };

    try {
      // Register the new agent
      this.agentManager.registerAgent(newAgentConfig);
      this.addLog('Agent cloned successfully', 'success');
      
      // Navigate to the new agent
      this.router.navigate(['/agents/agent', newAgentConfig.id]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog(`Failed to clone agent: ${errorMessage}`, 'error');
    }
  }

  onDeleteAgent(): void {
    if (!this.agent) return;
    
    // Use browser's native confirm dialog
    const confirmed = confirm(`Are you sure you want to delete "${this.agent.name}"? This action cannot be undone.`);
    
    if (confirmed) {
      try {
        this.agentManager.unregisterAgent(this.agent.id);
        this.addLog('Agent deleted successfully', 'success');
        this.router.navigate(['/agents/hub']);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.addLog(`Failed to delete agent: ${errorMessage}`, 'error');
      }
    }
  }
  
  // Removed duplicate addLog method

  onExportAgent(): void {
    if (this.agent) {
      // Export agent configuration
      const exportData = {
        agent: this.agent,
        executions: this.executions,
        dependencies: this.dependencies
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.agent.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'default';
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case 'running': return 'green';
      case 'completed': return 'blue';
      case 'failed': return 'red';
      case 'active': return '#52c41a';
      case 'idle': return '#faad14';
      case 'error': return '#ff4d4f';
      case 'disabled': return '#d9d9d9';
      case 'configuring': return '#1890ff';
      default: return 'default';
    }
  }

  getPriorityColor(priority: string | undefined): string {
    if (!priority) return 'default';
    const priorityStr = String(priority).toLowerCase();
    switch (priorityStr) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  }

  getExecutionStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'running': 'loading',
      'completed': 'check-circle',
      'failed': 'close-circle',
      'pending': 'clock-circle'
    };
    return statusIcons[status] || 'question-circle';
  }

  formatDuration(startTime: Date, endTime?: Date): string {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

}
