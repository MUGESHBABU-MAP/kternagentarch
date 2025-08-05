import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentOrchestrationService } from '../../services/agent-orchestration.service';
import { Agent, AgentStatus, AgentMessage, AgentWorkflow } from '../../interfaces/agent.interface';

interface AssessmentStep {
  id: number;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
  agents?: string[];
}

interface SystemConnectionDetails {
  systemId: string;
  connectionType: string;
  version: string;
  client: string;
  database?: string;
  landscapeType?: string;
}

interface ConnectionType {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface VPNConfig {
  type: string;
  serverAddress: string;
  username: string;
  password: string;
}

interface IPSecConfig {
  gateway: string;
  presharedKey: string;
  localNetwork: string;
  remoteNetwork: string;
}

interface LogFetchConfig {
  logType: string;
  dateRange: string;
}

interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  selected: boolean;
  agents: string[];
}

interface AssessmentConfig {
  depth: string;
  priority: string;
}

interface AssessmentResults {
  overallScore: number;
  criticalIssues: number;
  recommendations: number;
}

interface GeneratedReport {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
}

@Component({
  selector: 'app-agent-orchestration',
  templateUrl: './agent-orchestration.component.html',
  styleUrls: ['./agent-orchestration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentOrchestrationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Assessment Flow
  currentStepIndex = 0;
  assessmentSteps: AssessmentStep[] = [
    {
      id: 1,
      name: 'System Connection Setup',
      description: 'Configure secure connectivity to your SAP environment',
      icon: '🔗',
      completed: false,
      agents: []
    },
    {
      id: 2,
      name: 'Usage Logs Collection',
      description: 'Upload and analyze system usage logs with AI processing',
      icon: '📄',
      completed: false,
      agents: ['Data Processing Agent', 'System Analysis Agent']
    },
    {
      id: 3,
      name: 'Assessment Selection',
      description: 'Configure assessment scope and criteria',
      icon: '🎯',
      completed: false,
      agents: []
    },
    {
      id: 4,
      name: 'Agent Orchestration & Progress',
      description: 'Monitor AI agents as they analyze your system',
      icon: '🤖',
      completed: false,
      agents: ['System Analysis Agent', 'Data Processing Agent', 'Security Assessment Agent', 'Report Generation Agent']
    },
    {
      id: 5,
      name: 'Results & Reports',
      description: 'Review comprehensive analysis results',
      icon: '📊',
      completed: false,
      agents: ['Report Generation Agent']
    }
  ];

  // System Connection
  systemConnectionDetails: SystemConnectionDetails | null = null;
  selectedConnectionType: string = '';
  connectionTypes: ConnectionType[] = [
    {
      id: 'vpn',
      title: 'VPN Connection',
      description: 'Secure connection through VPN tunnel',
      icon: '🔒'
    },
    {
      id: 'ipsec',
      title: 'IPSec Tunnel',
      description: 'Direct IPSec tunnel connection',
      icon: '🛡️'
    },
    {
      id: 'connector',
      title: 'K-Tern Connector',
      description: 'Dedicated connector application',
      icon: '🔌'
    }
  ];

  vpnConfig: VPNConfig = {
    type: '',
    serverAddress: '',
    username: '',
    password: ''
  };

  ipsecConfig: IPSecConfig = {
    gateway: '',
    presharedKey: '',
    localNetwork: '',
    remoteNetwork: ''
  };

  connectorStep = 0;
  isTestingConnection = false;
  isConnecting = false;
  connectionStatus: any = null;
  sapLandscape: any = null;

  // Usage Logs
  selectedLogMethod: string = 'upload';
  uploadedFiles: File[] = [];
  isDragOver = false;
  logFetchConfig: LogFetchConfig = {
    logType: 'system',
    dateRange: '7d'
  };
  logsProcessingStatus: any = null;

  // Assessment Selection
  assessmentCategories: AssessmentCategory[] = [
    {
      id: 'performance',
      name: 'Performance Analysis',
      description: 'Analyze system performance and optimization opportunities',
      icon: '⚡',
      selected: false,
      agents: ['System Analysis Agent', 'Data Processing Agent']
    },
    {
      id: 'security',
      name: 'Security Assessment',
      description: 'Comprehensive security posture evaluation',
      icon: '🔒',
      selected: false,
      agents: ['Security Assessment Agent']
    },
    {
      id: 'compliance',
      name: 'Compliance Review',
      description: 'Regulatory compliance and governance assessment',
      icon: '📋',
      selected: false,
      agents: ['Security Assessment Agent', 'Report Generation Agent']
    },
    {
      id: 'modernization',
      name: 'Modernization Readiness',
      description: 'S/4HANA migration and modernization assessment',
      icon: '🚀',
      selected: false,
      agents: ['System Analysis Agent', 'Report Generation Agent']
    }
  ];

  assessmentConfig: AssessmentConfig = {
    depth: 'detailed',
    priority: 'performance'
  };

  // Agent Orchestration
  agents: Agent[] = [];
  messages: AgentMessage[] = [];
  workflow: AgentWorkflow | null = null;
  isRunning = false;
  selectedAgent: Agent | null = null;
  showMessages = true;

  // Results
  assessmentResults: AssessmentResults = {
    overallScore: 0,
    criticalIssues: 0,
    recommendations: 0
  };

  generatedReports: GeneratedReport[] = [];

  constructor(
    private orchestrationService: AgentOrchestrationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToServices();
    this.loadSystemConnectionDetails();
    this.initializeMockData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToServices(): void {
    // Subscribe to agents
    this.orchestrationService.getAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => {
        this.agents = agents;
        this.cdr.markForCheck();
      });

    // Subscribe to messages
    this.orchestrationService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.cdr.markForCheck();
      });

    // Subscribe to workflow
    this.orchestrationService.getWorkflow()
      .pipe(takeUntil(this.destroy$))
      .subscribe(workflow => {
        this.workflow = workflow;
        this.cdr.markForCheck();
      });

    // Subscribe to running state
    this.orchestrationService.getIsRunning()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isRunning => {
        this.isRunning = isRunning;
        this.cdr.markForCheck();
      });
  }

  private initializeMockData(): void {
    // Initialize mock assessment results
    this.assessmentResults = {
      overallScore: 85,
      criticalIssues: 3,
      recommendations: 12
    };

    // Initialize mock reports
    this.generatedReports = [
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'High-level overview and key findings',
        icon: '📋',
        type: 'pdf'
      },
      {
        id: 'technical-report',
        name: 'Technical Analysis Report',
        description: 'Detailed technical findings and recommendations',
        icon: '🔧',
        type: 'pdf'
      },
      {
        id: 'security-assessment',
        name: 'Security Assessment Report',
        description: 'Security vulnerabilities and compliance status',
        icon: '🔒',
        type: 'pdf'
      },
      {
        id: 'modernization-roadmap',
        name: 'Modernization Roadmap',
        description: 'S/4HANA migration strategy and timeline',
        icon: '🚀',
        type: 'pdf'
      }
    ];
  }

  // Assessment Flow Methods
  getOverallProgress(): number {
    const completedSteps = this.assessmentSteps.filter(step => step.completed).length;
    const currentProgress = (this.currentStepIndex + 1) / this.assessmentSteps.length;
    const completedProgress = completedSteps / this.assessmentSteps.length;
    return Math.max(currentProgress, completedProgress) * 100;
  }

  getStepClass(index: number): string {
    const baseClass = 'step-item';
    if (this.assessmentSteps[index].completed) {
      return `${baseClass} step-completed`;
    } else if (index === this.currentStepIndex) {
      return `${baseClass} step-active`;
    } else if (index < this.currentStepIndex) {
      return `${baseClass} step-accessible`;
    } else {
      return `${baseClass} step-inactive`;
    }
  }

  navigateToStep(stepIndex: number): void {
    if (this.isStepAccessible(stepIndex)) {
      this.currentStepIndex = stepIndex;
      this.cdr.markForCheck();
    }
  }

  getCurrentStepTitle(): string {
    const step = this.assessmentSteps[this.currentStepIndex];
    return step ? step.name : 'Assessment';
  }

  getCurrentStepIcon(): string {
    const step = this.assessmentSteps[this.currentStepIndex];
    return step ? step.icon : '🤖';
  }

  canProceedToNext(): boolean {
    switch (this.currentStepIndex) {
      case 0: // System Connection
        return this.connectionStatus && this.connectionStatus.success;
      case 1: // Usage Logs
        return this.uploadedFiles.length > 0 || this.selectedLogMethod === 'fetch';
      case 2: // Assessment Selection
        return this.getSelectedCategories().length > 0;
      case 3: // Orchestration
        return !!(this.workflow && this.workflow.progress === 100);
      case 4: // Results
        return false; // Last step
      default:
        return false;
    }
  }

  getNextButtonText(): string {
    if (this.currentStepIndex === this.assessmentSteps.length - 1) {
      return 'Complete Assessment';
    }
    return 'Next →';
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.cdr.markForCheck();
    }
  }

  nextStep(): void {
    if (this.canProceedToNext() && this.currentStepIndex < this.assessmentSteps.length - 1) {
      this.markStepCompleted(this.currentStepIndex);
      this.currentStepIndex++;
      this.cdr.markForCheck();
    }
  }

  resetAssessment(): void {
    this.assessmentSteps.forEach(step => step.completed = false);
    this.currentStepIndex = 0;
    this.systemConnectionDetails = null;
    this.selectedConnectionType = '';
    this.uploadedFiles = [];
    this.assessmentCategories.forEach(cat => cat.selected = false);
    this.cdr.markForCheck();
  }

  private markStepCompleted(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.assessmentSteps.length) {
      this.assessmentSteps[stepIndex].completed = true;
    }
  }

  private isStepAccessible(stepIndex: number): boolean {
    if (stepIndex === 0) return true;
    return this.assessmentSteps[stepIndex - 1].completed || stepIndex <= this.currentStepIndex;
  }

  // System Connection Methods
  selectConnectionType(typeId: string): void {
    this.selectedConnectionType = typeId;
    this.connectionStatus = null;
    this.cdr.markForCheck();
  }

  getConfigurationTitle(): string {
    const type = this.connectionTypes.find(t => t.id === this.selectedConnectionType);
    return type ? `${type.title} Configuration` : 'Configuration';
  }

  onConfigChange(): void {
    this.connectionStatus = null;
    this.cdr.markForCheck();
  }

  isConfigurationValid(): boolean {
    switch (this.selectedConnectionType) {
      case 'vpn':
        return !!(this.vpnConfig.type && this.vpnConfig.serverAddress && 
                 this.vpnConfig.username && this.vpnConfig.password);
      case 'ipsec':
        return !!(this.ipsecConfig.gateway && this.ipsecConfig.presharedKey && 
                 this.ipsecConfig.localNetwork && this.ipsecConfig.remoteNetwork);
      case 'connector':
        return this.connectorStep >= 2;
      default:
        return false;
    }
  }

  downloadConnector(): void {
    // Mock download
    this.connectorStep = Math.max(this.connectorStep, 1);
    this.cdr.markForCheck();
  }

  testConnection(): void {
    this.isTestingConnection = true;
    setTimeout(() => {
      this.isTestingConnection = false;
      this.connectorStep = Math.max(this.connectorStep, 2);
      this.cdr.markForCheck();
    }, 2000);
  }

  establishConnection(): void {
    this.isConnecting = true;
    setTimeout(() => {
      this.isConnecting = false;
      this.connectionStatus = {
        success: true,
        message: 'Connection Established Successfully',
        description: 'Your SAP system is now connected and ready for assessment.'
      };
      
      // Mock SAP landscape data
      this.sapLandscape = {
        systemId: 'PRD-001',
        version: 'SAP ECC 6.0 EHP8',
        client: '100',
        database: 'Oracle 19c',
        environment: 'Production'
      };

      // Set system connection details
      this.setSystemConnectionDetails({
        systemId: 'PRD-001',
        connectionType: this.getConnectionTypeTitle(),
        version: 'SAP ECC 6.0 EHP8',
        client: '100',
        database: 'Oracle 19c',
        landscapeType: 'Production'
      });

      this.cdr.markForCheck();
    }, 3000);
  }

  private getConnectionTypeTitle(): string {
    const type = this.connectionTypes.find(t => t.id === this.selectedConnectionType);
    return type ? type.title : 'Unknown';
  }

  getSystemDetails(): any[] {
    if (!this.sapLandscape) return [];
    
    return [
      { property: 'SYSTEM ID', value: this.sapLandscape.systemId },
      { property: 'VERSION', value: this.sapLandscape.version },
      { property: 'CLIENT', value: this.sapLandscape.client },
      { property: 'DATABASE', value: this.sapLandscape.database },
      { property: 'ENVIRONMENT', value: this.sapLandscape.environment }
    ];
  }

  private loadSystemConnectionDetails(): void {
    const saved = localStorage.getItem('agentic_system_connection_details');
    if (saved) {
      try {
        this.systemConnectionDetails = JSON.parse(saved);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading system connection details:', error);
      }
    }
  }

  setSystemConnectionDetails(details: SystemConnectionDetails): void {
    this.systemConnectionDetails = details;
    localStorage.setItem('agentic_system_connection_details', JSON.stringify(details));
    this.cdr.markForCheck();
  }

  editSystemConnection(): void {
    if (confirm('Editing system connection details will reset the current assessment progress. Continue?')) {
      this.resetAssessment();
      this.systemConnectionDetails = null;
      localStorage.removeItem('agentic_system_connection_details');
      this.cdr.markForCheck();
    }
  }

  // Usage Logs Methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from((event.dataTransfer && event.dataTransfer.files) ? event.dataTransfer.files : []);
    this.addFiles(files);
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.target.files || []) as File[];
    this.addFiles(files);
  }

  private addFiles(files: File[]): void {
    const validFiles = files.filter(file => 
      file.name.match(/\.(log|txt|csv|zip)$/i)
    );
    
    this.uploadedFiles.push(...validFiles);
    this.cdr.markForCheck();
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
    this.cdr.markForCheck();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  fetchLogs(): void {
    // Mock log fetching
    this.logsProcessingStatus = {
      status: 'processing',
      message: 'Fetching logs from system...'
    };
    this.cdr.markForCheck();
  }

  getProcessingAgents(): any[] {
    return [
      {
        name: 'Data Processing Agent',
        currentTask: 'Parsing log files',
        progress: 75
      },
      {
        name: 'System Analysis Agent',
        currentTask: 'Analyzing patterns',
        progress: 45
      }
    ];
  }

  // Assessment Selection Methods
  toggleCategory(category: AssessmentCategory): void {
    category.selected = !category.selected;
    this.cdr.markForCheck();
  }

  getSelectedCategories(): AssessmentCategory[] {
    return this.assessmentCategories.filter(cat => cat.selected);
  }

  // Agent Orchestration Methods (from original component)
  startWorkflow(): void {
    this.orchestrationService.startAssessmentWorkflow();
  }

  pauseAgent(agent: Agent): void {
    this.orchestrationService.pauseAgent(agent.id);
  }

  resumeAgent(agent: Agent): void {
    this.orchestrationService.resumeAgent(agent.id);
  }

  restartAgent(agent: Agent): void {
    this.orchestrationService.restartAgent(agent.id);
  }

  selectAgent(agent: Agent): void {
    this.selectedAgent = this.selectedAgent && this.selectedAgent.id === agent.id ? null : agent;
  }

  getStatusColor(status: AgentStatus): string {
    switch (status) {
      case AgentStatus.IDLE: return '#8c8c8c';
      case AgentStatus.INITIALIZING: return '#faad14';
      case AgentStatus.RUNNING: return '#1890ff';
      case AgentStatus.PROCESSING: return '#722ed1';
      case AgentStatus.COMPLETED: return '#52c41a';
      case AgentStatus.ERROR: return '#f5222d';
      case AgentStatus.PAUSED: return '#fa8c16';
      default: return '#8c8c8c';
    }
  }

  getStatusIcon(status: AgentStatus): string {
    switch (status) {
      case AgentStatus.IDLE: return '⏸️';
      case AgentStatus.INITIALIZING: return '🔄';
      case AgentStatus.RUNNING: return '▶️';
      case AgentStatus.PROCESSING: return '⚙️';
      case AgentStatus.COMPLETED: return '✅';
      case AgentStatus.ERROR: return '❌';
      case AgentStatus.PAUSED: return '⏸️';
      default: return '❓';
    }
  }

  getMessageTypeIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }

  getMessageTypeColor(type: string): string {
    switch (type) {
      case 'success': return '#52c41a';
      case 'error': return '#f5222d';
      case 'warning': return '#faad14';
      default: return '#1890ff';
    }
  }

  getWorkflowProgress(): number {
    if (!this.workflow) return 0;
    return this.workflow.progress;
  }

  clearMessages(): void {
    this.orchestrationService.clearMessages();
  }

  toggleMessages(): void {
    this.showMessages = !this.showMessages;
  }

  // Helper methods for template
  getAgentNameById(agentId: string): string {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? agent.name : 'System';
  }

  // TrackBy functions for performance
  trackByAgentId(index: number, agent: Agent): string {
    return agent.id;
  }

  trackByMessageId(index: number, message: AgentMessage): string {
    return message.id;
  }

  // Results Methods
  viewReport(report: GeneratedReport): void {
    console.log('Viewing report:', report.name);
    // Implement report viewing logic
  }

  downloadReport(report: GeneratedReport): void {
    console.log('Downloading report:', report.name);
    // Implement report download logic
  }
}
