import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface DigitalMap {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'sales' | 'procurement' | 'inventory';
  status: 'active' | 'draft' | 'archived';
  modules: number;
  processes: number;
  connections: number;
  lastUpdated: string;
  author: {
    name: string;
    initials: string;
  };
}

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapDashboardComponent implements OnInit {
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  allMaps: DigitalMap[] = [
    {
      id: '1',
      name: 'SAP S/4HANA Finance',
      description: 'Complete financial processes mapping including GL, AP, AR, and asset management',
      category: 'finance',
      status: 'active',
      modules: 8,
      processes: 24,
      connections: 156,
      lastUpdated: '2 hours ago',
      author: { name: 'Sarah Johnson', initials: 'SJ' }
    },
    {
      id: '2',
      name: 'Order-to-Cash Process',
      description: 'End-to-end sales process from quotation to payment collection',
      category: 'sales',
      status: 'active',
      modules: 5,
      processes: 18,
      connections: 89,
      lastUpdated: '1 day ago',
      author: { name: 'Michael Chen', initials: 'MC' }
    },
    {
      id: '3',
      name: 'Procurement Workflow',
      description: 'Purchase requisition to payment process mapping',
      category: 'procurement',
      status: 'draft',
      modules: 6,
      processes: 15,
      connections: 67,
      lastUpdated: '3 days ago',
      author: { name: 'Emma Wilson', initials: 'EW' }
    },
    {
      id: '4',
      name: 'Inventory Management',
      description: 'Warehouse and inventory control processes',
      category: 'inventory',
      status: 'active',
      modules: 4,
      processes: 12,
      connections: 45,
      lastUpdated: '1 week ago',
      author: { name: 'David Brown', initials: 'DB' }
    },
    {
      id: '5',
      name: 'Financial Reporting',
      description: 'Automated financial reporting and analytics workflows',
      category: 'finance',
      status: 'archived',
      modules: 3,
      processes: 8,
      connections: 23,
      lastUpdated: '2 weeks ago',
      author: { name: 'Lisa Garcia', initials: 'LG' }
    },
    {
      id: '6',
      name: 'Customer Service Portal',
      description: 'Customer interaction and support process mapping',
      category: 'sales',
      status: 'draft',
      modules: 7,
      processes: 20,
      connections: 112,
      lastUpdated: '5 days ago',
      author: { name: 'James Wilson', initials: 'JW' }
    }
  ];

  filteredMaps: DigitalMap[] = [];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filteredMaps = [...this.allMaps];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onViewModeChange(): void {
    this.cdr.markForCheck();
  }

  private applyFilters(): void {
    this.filteredMaps = this.allMaps.filter(map => {
      const matchesSearch = !this.searchTerm || 
        map.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        map.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        map.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || map.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || map.status === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    this.cdr.markForCheck();
  }

  getMapIcon(category: string): string {
    switch (category) {
      case 'finance': return 'dollar';
      case 'sales': return 'shopping-cart';
      case 'procurement': return 'shopping';
      case 'inventory': return 'inbox';
      default: return 'environment';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#52c41a';
      case 'draft': return '#faad14';
      case 'archived': return '#8c8c8c';
      default: return '#8c8c8c';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'finance': return 'blue';
      case 'sales': return 'green';
      case 'procurement': return 'orange';
      case 'inventory': return 'purple';
      default: return 'default';
    }
  }

  createNewMap(): void {
    this.message.info('Create new map functionality will be implemented');
  }

  importMap(): void {
    this.message.info('Import map functionality will be implemented');
  }

  exportMaps(): void {
    this.message.info('Export maps functionality will be implemented');
  }

  openMap(map: DigitalMap): void {
    this.message.info(`Opening map: ${map.name}`);
    // Navigate to map detail view
    // this.router.navigate(['/digital-maps/map', map.id]);
  }

  editMap(map: DigitalMap, event: Event): void {
    event.stopPropagation();
    this.message.info(`Editing map: ${map.name}`);
  }

  duplicateMap(map: DigitalMap, event: Event): void {
    event.stopPropagation();
    this.message.success(`Map "${map.name}" duplicated successfully`);
    
    // Create a duplicate with modified name
    const duplicate: DigitalMap = {
      ...map,
      id: Date.now().toString(),
      name: `${map.name} (Copy)`,
      status: 'draft',
      lastUpdated: 'just now',
      author: { name: 'Current User', initials: 'CU' }
    };
    
    this.allMaps.unshift(duplicate);
    this.applyFilters();
  }

  deleteMap(map: DigitalMap, event: Event): void {
    event.stopPropagation();
    
    // In a real app, you would show a confirmation modal
    const index = this.allMaps.findIndex(m => m.id === map.id);
    if (index > -1) {
      this.allMaps.splice(index, 1);
      this.applyFilters();
      this.message.success(`Map "${map.name}" deleted successfully`);
    }
  }
}
