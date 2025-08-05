import { Component, ChangeDetectionStrategy } from '@angular/core';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpModalComponent {
  searchTerm = '';
  
  faqs: FAQItem[] = [
    {
      id: 'sap-versions',
      question: 'What SAP versions are supported?',
      answer: 'We support <strong>SAP ECC 6.0 and above</strong>, <strong>SAP S/4HANA (all versions)</strong>, and <strong>SAP Business Suite applications</strong>. Our assessment tool is compatible with both on-premise and cloud deployments.',
      category: 'compatibility',
      keywords: ['sap', 'version', 'ecc', 's4hana', 'compatibility', 'support']
    },
    {
      id: 'connection-time',
      question: 'How long does the connection setup take?',
      answer: 'Connection setup typically takes <strong>5-15 minutes</strong> depending on your connection type and network configuration. VPN connections are usually faster, while IPSec may take longer due to additional security configurations.',
      category: 'setup',
      keywords: ['time', 'setup', 'connection', 'duration', 'vpn', 'ipsec']
    },
    {
      id: 'data-security',
      question: 'Is my data secure during the assessment?',
      answer: 'Yes, absolutely. All data is <strong>encrypted in transit and at rest</strong>. We follow industry-standard security practices including <strong>TLS 1.3 encryption</strong>, <strong>zero-trust architecture</strong>, and <strong>SOC 2 compliance</strong>. Your data never leaves your secure environment without proper encryption.',
      category: 'security',
      keywords: ['security', 'encryption', 'data', 'safe', 'tls', 'compliance']
    },
    {
      id: 'connection-failure',
      question: 'What if my connection fails?',
      answer: 'If connection fails, please check: <ul><li><strong>Network settings</strong> - Ensure proper connectivity</li><li><strong>Firewall rules</strong> - Allow required ports</li><li><strong>Credentials</strong> - Verify username and password</li><li><strong>System availability</strong> - Check if SAP system is running</li></ul>Contact support if issues persist.',
      category: 'troubleshooting',
      keywords: ['connection', 'fail', 'error', 'troubleshoot', 'network', 'firewall']
    },
    {
      id: 'change-settings',
      question: 'Can I change connection settings later?',
      answer: 'Yes, you can modify connection settings at any time. However, <strong>changing connection settings will reset your assessment progress</strong> and all steps will need to be completed again. We recommend finalizing your connection settings before starting the assessment.',
      category: 'settings',
      keywords: ['change', 'modify', 'settings', 'connection', 'reset', 'progress']
    },
    {
      id: 'sap-permissions',
      question: 'What permissions do I need in SAP?',
      answer: 'You need the following permissions: <ul><li><strong>Read access</strong> to system tables (TADIR, TDEVC, etc.)</li><li><strong>Transaction log access</strong> (SM21, ST22)</li><li><strong>Configuration data access</strong> (SPRO, SM30)</li><li><strong>User and authorization data</strong> (SU01, PFCG)</li><li><strong>System monitoring</strong> (SM50, SM66)</li></ul>A detailed permission list is available in our documentation.',
      category: 'permissions',
      keywords: ['permissions', 'access', 'authorization', 'sap', 'tables', 'user']
    },
    {
      id: 'connector-download',
      question: 'How do I download and install the K-Tern Connector?',
      answer: 'To download the K-Tern Connector: <ol><li>Click the <strong>"Download K-Tern Connector"</strong> button in the connector configuration section</li><li>Extract the downloaded package</li><li>Run the installer as administrator</li><li>Follow the installation wizard</li><li>Configure connection settings</li><li>Test the connection</li></ol>Installation instructions are included in the package.',
      category: 'connector',
      keywords: ['connector', 'download', 'install', 'ktern', 'setup', 'configuration']
    },
    {
      id: 'assessment-duration',
      question: 'How long does a complete assessment take?',
      answer: 'Assessment duration varies based on selected categories: <ul><li><strong>Landscape Assessment:</strong> 2-3 hours</li><li><strong>Business Transformation:</strong> 4-6 hours</li><li><strong>Process Assessment:</strong> 3-4 hours</li><li><strong>Custom Objects:</strong> 2-4 hours</li><li><strong>Timeline Assessment:</strong> 1-2 hours</li></ul>You can run assessments in parallel to reduce total time.',
      category: 'assessment',
      keywords: ['duration', 'time', 'assessment', 'complete', 'hours', 'categories']
    },
    {
      id: 'system-requirements',
      question: 'What are the minimum system requirements?',
      answer: 'Minimum system requirements: <ul><li><strong>RAM:</strong> 4GB (8GB recommended)</li><li><strong>Disk Space:</strong> 10GB free space</li><li><strong>Network:</strong> Stable internet connection (10 Mbps+)</li><li><strong>Browser:</strong> Chrome 90+, Firefox 88+, Edge 90+</li><li><strong>OS:</strong> Windows 10+, macOS 10.15+, Linux Ubuntu 18.04+</li></ul>',
      category: 'requirements',
      keywords: ['requirements', 'system', 'minimum', 'ram', 'disk', 'network', 'browser']
    },
    {
      id: 'multiple-systems',
      question: 'Can I assess multiple SAP systems?',
      answer: 'Yes, you can assess multiple SAP systems. Each system requires a separate connection configuration. You can: <ul><li>Switch between systems using the connection panel</li><li>Run parallel assessments on different systems</li><li>Compare results across systems</li><li>Export consolidated reports</li></ul>',
      category: 'multiple-systems',
      keywords: ['multiple', 'systems', 'parallel', 'switch', 'compare', 'consolidated']
    },
    {
      id: 'results-export',
      question: 'How can I export assessment results?',
      answer: 'Assessment results can be exported in multiple formats: <ul><li><strong>PDF Report:</strong> Executive summary with charts</li><li><strong>Excel Workbook:</strong> Detailed data with multiple sheets</li><li><strong>JSON Data:</strong> Raw data for integration</li><li><strong>PowerPoint:</strong> Presentation-ready slides</li></ul>All exports include recommendations and action items.',
      category: 'export',
      keywords: ['export', 'results', 'pdf', 'excel', 'json', 'powerpoint', 'report']
    },
    {
      id: 'offline-mode',
      question: 'Can I run assessments offline?',
      answer: 'Limited offline functionality is available: <ul><li><strong>Data Collection:</strong> Can be done offline with connector</li><li><strong>Analysis:</strong> Requires internet connection</li><li><strong>Report Generation:</strong> Can be done offline</li><li><strong>Recommendations:</strong> Requires online AI processing</li></ul>We recommend maintaining internet connectivity for best results.',
      category: 'offline',
      keywords: ['offline', 'internet', 'connection', 'analysis', 'recommendations', 'connectivity']
    }
  ];

  filteredFAQs: FAQItem[] = [...this.faqs];

  filterFAQ(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFAQs = [...this.faqs];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredFAQs = this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  }
}
