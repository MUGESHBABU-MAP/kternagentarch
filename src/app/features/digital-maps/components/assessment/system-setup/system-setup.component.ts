import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SystemConnectionService } from '../../../../../core/services/system-connection.service';

interface PrerequisiteItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'success' | 'warning' | 'info';
}

interface ConnectionType {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface VpnConfig {
  type: 'openvpn' | 'standard' | null;
  serverAddress: string;
  username: string;
  password: string;
  port: number;
  protocol: 'udp' | 'tcp';
}

interface IpsecConfig {
  gateway: string;
  presharedKey: string;
  localNetwork: string;
  remoteNetwork: string;
}

interface ConnectionStatus {
  success: boolean;
  message: string;
  description: string;
}

interface SapLandscape {
  systemId: string;
  version: string;
  database: string;
  client: string;
  landscapeType: string;
}

interface SystemDetail {
  property: string;
  value: string;
}

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemSetupComponent implements OnInit {
  // Prerequisites
  prerequisites: PrerequisiteItem[] = [
    {
      id: 'sap_version',
      title: 'SAP System Version',
      description: 'SAP ECC 6.0 or higher, or SAP S/4HANA system',
      icon: 'desktop',
      status: 'info'
    },
    {
      id: 'network_access',
      title: 'Network Access',
      description: 'Stable network connection to SAP system',
      icon: 'wifi',
      status: 'info'
    },
    {
      id: 'user_permissions',
      title: 'User Permissions',
      description: 'Administrator or equivalent privileges',
      icon: 'user',
      status: 'info'
    },
    {
      id: 'system_resources',
      title: 'System Resources',
      description: 'Minimum 4GB RAM and 10GB free disk space',
      icon: 'hdd',
      status: 'info'
    }
  ];

  // Connection Types
  connectionTypes: ConnectionType[] = [
    {
      id: 'vpn',
      title: 'VPN Connection',
      description: 'Connect via VPN (OpenVPN or Standard VPN)',
      icon: 'safety-certificate'
    },
    {
      id: 'ipsec',
      title: 'IPSec Connection',
      description: 'Template-based IPSec configuration',
      icon: 'lock'
    },
    {
      id: 'connector',
      title: 'K-Tern Connector',
      description: 'Use K-Tern connector for direct connection',
      icon: 'deployment-unit'
    }
  ];

  // Component State
  selectedConnectionType: string | null = null;
  
  // VPN Configuration
  vpnConfig: VpnConfig = {
    type: null,
    serverAddress: '',
    username: '',
    password: '',
    port: 1194,
    protocol: 'udp'
  };

  // IPSec Configuration
  ipsecConfig: IpsecConfig = {
    gateway: '',
    presharedKey: '',
    localNetwork: '',
    remoteNetwork: ''
  };

  // Connector State
  connectorStep = 0;
  isTestingConnection = false;

  // Connection State
  isConnecting = false;
  connectionStatus: ConnectionStatus | null = null;
  sapLandscape: SapLandscape | null = null;

  // Panel State
  helpExpanded = false;
  prerequisitesExpanded = false;
  helpPanelWidth = '50%';
  activeHelpTab = 'quickstart';

  constructor(
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private systemConnectionService: SystemConnectionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSavedConfiguration();
  }

  selectConnectionType(typeId: string): void {
    this.selectedConnectionType = typeId;
    this.resetConnectionStatus();
    this.saveConfiguration();
    this.cdr.markForCheck();
  }

  onVpnTypeChange(): void {
    this.resetConnectionStatus();
    this.onConfigChange();
  }

  onConfigChange(): void {
    this.resetConnectionStatus();
    this.saveConfiguration();
    this.cdr.markForCheck();
  }

  isConfigurationValid(): boolean {
    switch (this.selectedConnectionType) {
      case 'vpn':
        return !!(this.vpnConfig.type && 
                 this.vpnConfig.serverAddress && 
                 this.vpnConfig.username && 
                 this.vpnConfig.password);
      
      case 'ipsec':
        return !!(this.ipsecConfig.gateway && 
                 this.ipsecConfig.presharedKey && 
                 this.ipsecConfig.localNetwork && 
                 this.ipsecConfig.remoteNetwork);
      
      case 'connector':
        return this.connectorStep >= 2; // At least installed and configured
      
      default:
        return false;
    }
  }

  downloadConnector(): void {
    // Mock download functionality
    this.message.info('Downloading K-Tern Connector...');
    setTimeout(() => {
      this.connectorStep = 1;
      this.message.success('Connector downloaded successfully!');
      this.cdr.markForCheck();
    }, 2000);
  }

  testConnection(): void {
    this.isTestingConnection = true;
    this.cdr.markForCheck();

    // Mock connection test
    setTimeout(() => {
      this.connectorStep = 2;
      this.isTestingConnection = false;
      this.message.success('Connection test successful!');
      this.cdr.markForCheck();
    }, 3000);
  }

  establishConnection(): void {
    this.isConnecting = true;
    this.connectionStatus = null;
    this.sapLandscape = null;
    this.cdr.markForCheck();

    // Mock API call to establish connection
    this.systemConnectionService.connect({
      type: this.selectedConnectionType || '',
      credentials: this.getConnectionCredentials()
    }).subscribe({
      next: (response: any) => {
        this.connectionStatus = {
          success: true,
          message: 'Connection Established Successfully',
          description: 'SAP system connection has been established and landscape information retrieved.'
        };
        
        // Mock SAP landscape data
        this.sapLandscape = {
          systemId: response.systemId || 'PRD',
          version: response.version || 'SAP ECC 6.0 EHP8',
          database: response.database || 'Oracle 19c',
          client: response.client || '100',
          landscapeType: response.landscapeType || 'Production'
        };

        this.isConnecting = false;
        this.message.success('Connection established successfully!');
        this.saveConfiguration();
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        this.connectionStatus = {
          success: false,
          message: 'Connection Failed',
          description: 'Unable to establish connection to SAP system. Please check your configuration and try again.'
        };
        this.isConnecting = false;
        this.message.error('Failed to establish connection');
        this.cdr.markForCheck();
      }
    });
  }

  private getConnectionCredentials(): any {
    switch (this.selectedConnectionType) {
      case 'vpn':
        return {
          username: this.vpnConfig.username,
          password: this.vpnConfig.password,
          server: this.vpnConfig.serverAddress,
          port: this.vpnConfig.port
        };
      case 'ipsec':
        return {
          gateway: this.ipsecConfig.gateway,
          presharedKey: this.ipsecConfig.presharedKey
        };
      case 'connector':
        return { step: this.connectorStep };
      default:
        return {};
    }
  }

  resetConfiguration(): void {
    this.selectedConnectionType = null;
    this.vpnConfig = {
      type: null,
      serverAddress: '',
      username: '',
      password: '',
      port: 1194,
      protocol: 'udp'
    };
    this.ipsecConfig = {
      gateway: '',
      presharedKey: '',
      localNetwork: '',
      remoteNetwork: ''
    };
    this.connectorStep = 0;
    this.resetConnectionStatus();
    this.saveConfiguration();
    this.message.info('Configuration has been reset');
    this.cdr.markForCheck();
  }

  private resetConnectionStatus(): void {
    this.connectionStatus = null;
    this.sapLandscape = null;
  }

  isSetupComplete(): boolean {
    return !!(this.connectionStatus && this.connectionStatus.success && this.sapLandscape);
  }

  proceedToNext(): void {
    if (this.isSetupComplete()) {
      this.message.success('System setup completed successfully!');
      // Navigate to next step (Usage Logs)
      this.router.navigate(['/digital-maps/assessment/usage-logs']);
    }
  }

  showHelp(): void {
    this.modal.create({
      nzTitle: 'Help & FAQ',
      nzContent: '<app-help-modal></app-help-modal>',
      nzWidth: 900,
      nzFooter: null,
      nzBodyStyle: { padding: '16px' }
    });
  }

  showFAQ(): void {
    this.showHelp(); // Both buttons open the same professional modal with tabs
  }

  toggleHelpPanel(): void {
    this.helpExpanded = !this.helpExpanded;
    if (this.helpExpanded) {
      this.helpPanelWidth = '70%';
      this.prerequisitesExpanded = false;
    } else {
      this.helpPanelWidth = '50%';
    }
    this.cdr.markForCheck();
  }

  togglePrerequisitesPanel(): void {
    this.prerequisitesExpanded = !this.prerequisitesExpanded;
    if (this.prerequisitesExpanded) {
      this.helpPanelWidth = '30%';
      this.helpExpanded = false;
    } else {
      this.helpPanelWidth = '50%';
    }
    this.cdr.markForCheck();
  }

  getConfigurationTitle(): string {
    switch (this.selectedConnectionType) {
      case 'vpn':
        return 'VPN Connection Configuration';
      case 'ipsec':
        return 'IPSec Tunnel Configuration';
      case 'connector':
        return 'K-Tern Connector Setup';
      default:
        return 'Connection Configuration';
    }
  }

  getSystemDetails(): SystemDetail[] {
    if (!this.sapLandscape) {
      return [];
    }
    
    return [
      { property: 'System ID', value: this.sapLandscape.systemId },
      { property: 'Version', value: this.sapLandscape.version },
      { property: 'Database', value: this.sapLandscape.database },
      { property: 'Client', value: this.sapLandscape.client },
      { property: 'Environment', value: this.sapLandscape.landscapeType }
    ];
  }

  private saveConfiguration(): void {
    const config = {
      selectedConnectionType: this.selectedConnectionType,
      vpnConfig: this.vpnConfig,
      ipsecConfig: this.ipsecConfig,
      connectorStep: this.connectorStep,
      connectionStatus: this.connectionStatus,
      sapLandscape: this.sapLandscape,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('assessment_system_setup', JSON.stringify(config));
  }

  private loadSavedConfiguration(): void {
    const saved = localStorage.getItem('assessment_system_setup');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.selectedConnectionType = config.selectedConnectionType || null;
        this.vpnConfig = { ...this.vpnConfig, ...config.vpnConfig };
        this.ipsecConfig = { ...this.ipsecConfig, ...config.ipsecConfig };
        this.connectorStep = config.connectorStep || 0;
        this.connectionStatus = config.connectionStatus || null;
        this.sapLandscape = config.sapLandscape || null;
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading saved configuration:', error);
      }
    }
  }
}
