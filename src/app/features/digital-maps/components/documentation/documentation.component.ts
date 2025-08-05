import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface Contributor {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'technical' | 'process' | 'api';
  status: 'published' | 'draft' | 'review';
  pages: number;
  views: number;
  version: string;
  contributors: Contributor[];
  lastUpdated: string;
  format: string;
}

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentationComponent implements OnInit {
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  allDocuments: Document[] = [
    {
      id: '1',
      title: 'SAP S/4HANA Implementation Guide',
      description: 'Complete guide for implementing SAP S/4HANA with best practices, configuration steps, and troubleshooting tips',
      category: 'guide',
      status: 'published',
      pages: 45,
      views: 234,
      version: '2.1',
      contributors: [
        { id: '1', name: 'Sarah Johnson', initials: 'SJ', color: '#1890ff' },
        { id: '2', name: 'Michael Chen', initials: 'MC', color: '#52c41a' },
        { id: '3', name: 'Emma Wilson', initials: 'EW', color: '#722ed1' }
      ],
      lastUpdated: '2 days ago',
      format: 'PDF'
    },
    {
      id: '2',
      title: 'API Integration Documentation',
      description: 'Technical documentation for REST API endpoints, authentication, and integration patterns',
      category: 'api',
      status: 'published',
      pages: 28,
      views: 156,
      version: '1.3',
      contributors: [
        { id: '2', name: 'Michael Chen', initials: 'MC', color: '#52c41a' },
        { id: '4', name: 'David Brown', initials: 'DB', color: '#faad14' }
      ],
      lastUpdated: '1 week ago',
      format: 'HTML'
    },
    {
      id: '3',
      title: 'Business Process Mapping',
      description: 'Comprehensive documentation of business processes including workflows, decision points, and stakeholder responsibilities',
      category: 'process',
      status: 'review',
      pages: 67,
      views: 89,
      version: '3.0',
      contributors: [
        { id: '3', name: 'Emma Wilson', initials: 'EW', color: '#722ed1' },
        { id: '5', name: 'Lisa Garcia', initials: 'LG', color: '#eb2f96' },
        { id: '6', name: 'James Wilson', initials: 'JW', color: '#13c2c2' }
      ],
      lastUpdated: '3 days ago',
      format: 'DOCX'
    },
    {
      id: '4',
      title: 'System Architecture Overview',
      description: 'Technical architecture documentation covering system components, data flows, and integration points',
      category: 'technical',
      status: 'published',
      pages: 52,
      views: 178,
      version: '1.8',
      contributors: [
        { id: '2', name: 'Michael Chen', initials: 'MC', color: '#52c41a' },
        { id: '4', name: 'David Brown', initials: 'DB', color: '#faad14' },
        { id: '7', name: 'Alex Turner', initials: 'AT', color: '#f759ab' }
      ],
      lastUpdated: '5 days ago',
      format: 'PDF'
    },
    {
      id: '5',
      title: 'User Training Manual',
      description: 'Step-by-step user training manual with screenshots, exercises, and best practices for end users',
      category: 'guide',
      status: 'draft',
      pages: 38,
      views: 45,
      version: '0.9',
      contributors: [
        { id: '1', name: 'Sarah Johnson', initials: 'SJ', color: '#1890ff' },
        { id: '5', name: 'Lisa Garcia', initials: 'LG', color: '#eb2f96' }
      ],
      lastUpdated: '1 day ago',
      format: 'PDF'
    },
    {
      id: '6',
      title: 'Data Migration Procedures',
      description: 'Technical procedures for data migration including validation scripts, rollback procedures, and testing protocols',
      category: 'technical',
      status: 'published',
      pages: 34,
      views: 123,
      version: '2.2',
      contributors: [
        { id: '4', name: 'David Brown', initials: 'DB', color: '#faad14' },
        { id: '6', name: 'James Wilson', initials: 'JW', color: '#13c2c2' }
      ],
      lastUpdated: '1 week ago',
      format: 'HTML'
    }
  ];

  filteredDocuments: Document[] = [];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filteredDocuments = [...this.allDocuments];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredDocuments = this.allDocuments.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || doc.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || doc.status === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    this.cdr.markForCheck();
  }

  getDocumentIcon(category: string): string {
    switch (category) {
      case 'guide': return 'book';
      case 'technical': return 'code';
      case 'process': return 'apartment';
      case 'api': return 'api';
      default: return 'file-text';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'guide': return '#1890ff';
      case 'technical': return '#52c41a';
      case 'process': return '#722ed1';
      case 'api': return '#faad14';
      default: return '#8c8c8c';
    }
  }

  getCategoryTagColor(category: string): string {
    switch (category) {
      case 'guide': return 'blue';
      case 'technical': return 'green';
      case 'process': return 'purple';
      case 'api': return 'orange';
      default: return 'default';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'published': return '#52c41a';
      case 'draft': return '#faad14';
      case 'review': return '#1890ff';
      default: return '#8c8c8c';
    }
  }

  createDocument(): void {
    this.message.info('Create document functionality will be implemented');
  }

  importDocument(): void {
    this.message.info('Import document functionality will be implemented');
  }

  exportAll(): void {
    this.message.info('Export all documents functionality will be implemented');
  }

  generateReport(): void {
    this.message.info('Generate report functionality will be implemented');
  }

  manageTemplates(): void {
    this.message.info('Manage templates functionality will be implemented');
  }

  openDocument(doc: Document): void {
    this.message.info(`Opening document: ${doc.title}`);
    // Navigate to document viewer
    // this.router.navigate(['/digital-maps/document', doc.id]);
  }

  editDocument(doc: Document, event: Event): void {
    event.stopPropagation();
    this.message.info(`Editing document: ${doc.title}`);
  }

  shareDocument(doc: Document, event: Event): void {
    event.stopPropagation();
    this.message.success(`Document "${doc.title}" shared successfully`);
  }

  duplicateDocument(doc: Document, event: Event): void {
    event.stopPropagation();
    this.message.success(`Document "${doc.title}" duplicated successfully`);
    
    // Create a duplicate with modified name
    const duplicate: Document = {
      ...doc,
      id: Date.now().toString(),
      title: `${doc.title} (Copy)`,
      status: 'draft',
      version: '0.1',
      views: 0,
      lastUpdated: 'just now',
      contributors: [{ id: 'current', name: 'Current User', initials: 'CU', color: '#1890ff' }]
    };
    
    this.allDocuments.unshift(duplicate);
    this.applyFilters();
  }

  downloadDocument(doc: Document, event: Event): void {
    event.stopPropagation();
    this.message.success(`Document "${doc.title}" download started`);
  }

  deleteDocument(doc: Document, event: Event): void {
    event.stopPropagation();
    
    // In a real app, you would show a confirmation modal
    const index = this.allDocuments.findIndex(d => d.id === doc.id);
    if (index > -1) {
      this.allDocuments.splice(index, 1);
      this.applyFilters();
      this.message.success(`Document "${doc.title}" deleted successfully`);
    }
  }
}
