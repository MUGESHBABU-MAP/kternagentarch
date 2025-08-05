import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface AssessmentCategory {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  iconClass: string;
  mandatory: boolean;
  selected: boolean;
  estimatedDuration: string;
  complexity: number; // 1-3 scale
  dataSources: string[];
  features: string[];
}

interface AssessmentConfig {
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  reportFormat: 'pdf' | 'excel' | 'both';
  includeRecommendations: boolean;
  priorityFocus: 'performance' | 'security' | 'cost' | 'modernization';
}

@Component({
  selector: 'app-assessment-selection',
  templateUrl: './assessment-selection.component.html',
  styleUrls: ['./assessment-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentSelectionComponent implements OnInit {
  assessmentCategories: AssessmentCategory[] = [
    {
      id: 'landscape',
      title: 'Landscape Assessment',
      description: 'Comprehensive analysis of your SAP system landscape, architecture, and infrastructure components.',
      shortDescription: 'System landscape and architecture analysis',
      icon: 'cluster',
      iconClass: 'mandatory-icon',
      mandatory: true,
      selected: true,
      estimatedDuration: '2-3 hours',
      complexity: 2,
      dataSources: ['System Tables', 'Configuration', 'Infrastructure'],
      features: [
        'System architecture mapping',
        'Component dependency analysis',
        'Infrastructure assessment',
        'Integration points identification'
      ]
    },
    {
      id: 'business-transformation',
      title: 'Business Transformation',
      description: 'Evaluate business processes, organizational readiness, and transformation opportunities for digital modernization.',
      shortDescription: 'Business process and transformation readiness',
      icon: 'rocket',
      iconClass: 'optional-icon',
      mandatory: false,
      selected: false,
      estimatedDuration: '4-6 hours',
      complexity: 3,
      dataSources: ['Process Data', 'User Analytics', 'Business Rules'],
      features: [
        'Process optimization analysis',
        'Digital readiness assessment',
        'Change impact evaluation',
        'ROI projections'
      ]
    },
    {
      id: 'process',
      title: 'Process Assessment',
      description: 'Deep dive into business processes, workflows, and operational efficiency within your SAP environment.',
      shortDescription: 'Business process and workflow analysis',
      icon: 'flow-chart',
      iconClass: 'optional-icon',
      mandatory: false,
      selected: false,
      estimatedDuration: '3-4 hours',
      complexity: 2,
      dataSources: ['Workflow Logs', 'Process Mining', 'User Transactions'],
      features: [
        'Process flow mapping',
        'Bottleneck identification',
        'Automation opportunities',
        'Performance metrics'
      ]
    },
    {
      id: 'custom-objects',
      title: 'Custom Objects Assessment',
      description: 'Analysis of custom developments, modifications, and extensions in your SAP system.',
      shortDescription: 'Custom code and object analysis',
      icon: 'code',
      iconClass: 'optional-icon',
      mandatory: false,
      selected: false,
      estimatedDuration: '2-4 hours',
      complexity: 3,
      dataSources: ['Custom Code', 'Modifications', 'Enhancements'],
      features: [
        'Custom code inventory',
        'Modification impact analysis',
        'Upgrade compatibility check',
        'Simplification recommendations'
      ]
    },
    {
      id: 'timeline',
      title: 'Timeline Assessment',
      description: 'Project timeline estimation, milestone planning, and resource allocation for your SAP transformation journey.',
      shortDescription: 'Project timeline and resource planning',
      icon: 'schedule',
      iconClass: 'optional-icon',
      mandatory: false,
      selected: false,
      estimatedDuration: '1-2 hours',
      complexity: 1,
      dataSources: ['Project Data', 'Resource Planning', 'Historical Data'],
      features: [
        'Timeline estimation',
        'Resource requirement analysis',
        'Risk assessment',
        'Milestone planning'
      ]
    }
  ];

  assessmentConfig: AssessmentConfig = {
    analysisDepth: 'detailed',
    reportFormat: 'both',
    includeRecommendations: true,
    priorityFocus: 'performance'
  };

  constructor(
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSavedSelection();
  }

  onCategoryChange(category: AssessmentCategory): void {
    if (!category.mandatory) {
      this.saveSelection();
      this.cdr.markForCheck();
    }
  }

  onConfigChange(): void {
    this.saveSelection();
    this.cdr.markForCheck();
  }

  getSelectedCategories(): AssessmentCategory[] {
    return this.assessmentCategories.filter(cat => cat.selected);
  }

  getSelectedCount(): number {
    return this.getSelectedCategories().length;
  }

  getTotalEstimatedDuration(): string {
    const selected = this.getSelectedCategories();
    if (selected.length === 0) return '0 hours';
    
    let totalHours = 0;
    selected.forEach(cat => {
      const duration = cat.estimatedDuration;
      const hours = duration.match(/(\d+)-?(\d+)?/);
      if (hours) {
        const min = parseInt(hours[1]);
        const max = hours[2] ? parseInt(hours[2]) : min;
        totalHours += (min + max) / 2;
      }
    });
    
    return `${Math.round(totalHours)} hours`;
  }

  getAverageComplexity(): number {
    const selected = this.getSelectedCategories();
    if (selected.length === 0) return 0;
    
    const totalComplexity = selected.reduce((sum, cat) => sum + cat.complexity, 0);
    return Math.round((totalComplexity / selected.length) * 10) / 10;
  }

  getComplexityStars(complexity: number): { filled: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 3; i++) {
      stars.push({ filled: i <= complexity });
    }
    return stars;
  }

  isSelectionValid(): boolean {
    return this.getSelectedCategories().length > 0;
  }

  resetSelection(): void {
    this.assessmentCategories.forEach(cat => {
      if (!cat.mandatory) {
        cat.selected = false;
      }
    });
    
    this.assessmentConfig = {
      analysisDepth: 'detailed',
      reportFormat: 'both',
      includeRecommendations: true,
      priorityFocus: 'performance'
    };
    
    this.saveSelection();
    this.message.info('Selection has been reset');
    this.cdr.markForCheck();
  }

  proceedToAssessment(): void {
    if (this.isSelectionValid()) {
      const selectedCategories = this.getSelectedCategories();
      this.message.success(`Starting assessment with ${selectedCategories.length} categories...`);
      
      // Save final selection
      this.saveSelection();
      
      // Navigate to assessment progress
      this.router.navigate(['/digital-maps/assessment/progress']);
    } else {
      this.message.warning('Please select at least one assessment category');
    }
  }

  private saveSelection(): void {
    const selectionData = {
      categories: this.assessmentCategories.map(cat => ({
        id: cat.id,
        selected: cat.selected
      })),
      config: this.assessmentConfig,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('assessment_selection', JSON.stringify(selectionData));
  }

  private loadSavedSelection(): void {
    const saved = localStorage.getItem('assessment_selection');
    if (saved) {
      try {
        const selectionData = JSON.parse(saved);
        
        // Restore category selections
        if (selectionData.categories) {
          selectionData.categories.forEach((savedCat: any) => {
            const category = this.assessmentCategories.find(cat => cat.id === savedCat.id);
            if (category && !category.mandatory) {
              category.selected = savedCat.selected;
            }
          });
        }
        
        // Restore configuration
        if (selectionData.config) {
          this.assessmentConfig = { ...this.assessmentConfig, ...selectionData.config };
        }
        
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading saved selection:', error);
      }
    }
  }
}
