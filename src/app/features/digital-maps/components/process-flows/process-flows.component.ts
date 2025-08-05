import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ProcessStep {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
}

interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  type: 'business' | 'technical' | 'integration';
  status: 'active' | 'draft' | 'review' | 'archived';
  steps: number;
  complexity: number;
  duration: string;
  stakeholders: number;
  lastUpdated: string;
  author: {
    name: string;
    initials: string;
  };
}

@Component({
  selector: 'app-process-flows',
  templateUrl: './process-flows.component.html',
  styleUrls: ['./process-flows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessFlowsComponent implements OnInit {
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';
  sortBy = 'name';
  
  allProcesses: ProcessFlow[] = [
    {
      id: '1',
      name: 'Order Processing Workflow',
      description: 'Complete order-to-cash process including order creation, approval, fulfillment, and invoicing',
      type: 'business',
      status: 'active',
      steps: 8,
      complexity: 75,
      duration: '2-3 days',
      stakeholders: 5,
      lastUpdated: '2 hours ago',
      author: { name: 'Sarah Johnson', initials: 'SJ' }
    },
    {
      id: '2',
      name: 'API Integration Flow',
      description: 'Technical integration process for connecting SAP with external systems via REST APIs',
      type: 'technical',
      status: 'active',
      steps: 6,
      complexity: 85,
      duration: '1 day',
      stakeholders: 3,
      lastUpdated: '1 day ago',
      author: { name: 'Michael Chen', initials: 'MC' }
    },
    {
      id: '3',
      name: 'Purchase Requisition',
      description: 'Procurement workflow from requisition creation to purchase order approval',
      type: 'business',
      status: 'draft',
      steps: 5,
      complexity: 60,
      duration: '1-2 days',
      stakeholders: 4,
      lastUpdated: '3 days ago',
      author: { name: 'Emma Wilson', initials: 'EW' }
    },
    {
      id: '4',
      name: 'Data Migration Process',
      description: 'Technical process for migrating legacy data to SAP S/4HANA',
      type: 'technical',
      status: 'review',
      steps: 10,
      complexity: 95,
      duration: '1 week',
      stakeholders: 6,
      lastUpdated: '1 week ago',
      author: { name: 'David Brown', initials: 'DB' }
    },
    {
      id: '5',
      name: 'EDI Integration',
      description: 'Electronic Data Interchange setup for automated business document exchange',
      type: 'integration',
      status: 'active',
      steps: 7,
      complexity: 80,
      duration: '3-4 days',
      stakeholders: 4,
      lastUpdated: '5 days ago',
      author: { name: 'Lisa Garcia', initials: 'LG' }
    },
    {
      id: '6',
      name: 'Financial Closing Process',
      description: 'Month-end financial closing workflow with automated validations and approvals',
      type: 'business',
      status: 'archived',
      steps: 12,
      complexity: 70,
      duration: '2-3 days',
      stakeholders: 8,
      lastUpdated: '2 weeks ago',
      author: { name: 'James Wilson', initials: 'JW' }
    }
  ];

  filteredProcesses: ProcessFlow[] = [];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filteredProcesses = [...this.allProcesses];
    this.applySorting();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applySorting();
  }

  private applyFilters(): void {
    this.filteredProcesses = this.allProcesses.filter(process => {
      const matchesSearch = !this.searchTerm || 
        process.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        process.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedType || process.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || process.status === this.selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    this.applySorting();
  }

  private applySorting(): void {
    this.filteredProcesses.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return this.getUpdateTimestamp(b.lastUpdated) - this.getUpdateTimestamp(a.lastUpdated);
        case 'complexity':
          return b.complexity - a.complexity;
        default:
          return 0;
      }
    });
    
    this.cdr.markForCheck();
  }

  private getUpdateTimestamp(timeString: string): number {
    // Simple timestamp conversion for sorting
    if (timeString.includes('hour')) return Date.now() - (parseInt(timeString) * 60 * 60 * 1000);
    if (timeString.includes('day')) return Date.now() - (parseInt(timeString) * 24 * 60 * 60 * 1000);
    if (timeString.includes('week')) return Date.now() - (parseInt(timeString) * 7 * 24 * 60 * 60 * 1000);
    return Date.now();
  }

  getProcessIcon(type: string): string {
    switch (type) {
      case 'business': return 'user';
      case 'technical': return 'code';
      case 'integration': return 'api';
      default: return 'branch';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'business': return '#1890ff';
      case 'technical': return '#52c41a';
      case 'integration': return '#722ed1';
      default: return '#8c8c8c';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#52c41a';
      case 'draft': return '#faad14';
      case 'review': return '#1890ff';
      case 'archived': return '#8c8c8c';
      default: return '#8c8c8c';
    }
  }

  getProcessSteps(process: ProcessFlow): ProcessStep[] {
    const steps: ProcessStep[] = [];
    const completedSteps = Math.floor(process.steps * 0.6); // 60% completed
    const activeStep = process.status === 'active' ? 1 : 0;
    
    for (let i = 0; i < process.steps; i++) {
      let status: 'completed' | 'active' | 'pending' = 'pending';
      
      if (i < completedSteps) {
        status = 'completed';
      } else if (i === completedSteps && activeStep > 0) {
        status = 'active';
      }
      
      steps.push({
        id: `${process.id}-step-${i + 1}`,
        name: `Step ${i + 1}`,
        status
      });
    }
    
    return steps;
  }

  createNewProcess(): void {
    this.message.info('Create new process functionality will be implemented');
  }

  importProcess(): void {
    this.message.info('Import process functionality will be implemented');
  }

  exportProcesses(): void {
    this.message.info('Export all processes functionality will be implemented');
  }

  validateProcesses(): void {
    this.message.success('All processes validated successfully');
  }

  generateReport(): void {
    this.message.info('Generating process report...');
  }

  openProcess(process: ProcessFlow): void {
    this.message.info(`Opening process: ${process.name}`);
    // Navigate to process detail view
    // this.router.navigate(['/digital-maps/process', process.id]);
  }

  editProcess(process: ProcessFlow, event: Event): void {
    event.stopPropagation();
    this.message.info(`Editing process: ${process.name}`);
  }

  duplicateProcess(process: ProcessFlow, event: Event): void {
    event.stopPropagation();
    this.message.success(`Process "${process.name}" duplicated successfully`);
    
    // Create a duplicate with modified name
    const duplicate: ProcessFlow = {
      ...process,
      id: Date.now().toString(),
      name: `${process.name} (Copy)`,
      status: 'draft',
      lastUpdated: 'just now',
      author: { name: 'Current User', initials: 'CU' }
    };
    
    this.allProcesses.unshift(duplicate);
    this.applyFilters();
  }

  exportProcess(process: ProcessFlow, event: Event): void {
    event.stopPropagation();
    this.message.success(`Process "${process.name}" exported successfully`);
  }

  deleteProcess(process: ProcessFlow, event: Event): void {
    event.stopPropagation();
    
    // In a real app, you would show a confirmation modal
    const index = this.allProcesses.findIndex(p => p.id === process.id);
    if (index > -1) {
      this.allProcesses.splice(index, 1);
      this.applyFilters();
      this.message.success(`Process "${process.name}" deleted successfully`);
    }
  }
}
