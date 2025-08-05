import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-digital-maps-layout',
  templateUrl: './digital-maps-layout.component.html',
  styleUrls: ['./digital-maps-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DigitalMapsLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  userRole: 'developer' | 'stakeholder' | 'integrator' = 'developer';
  searchTerm = '';
  currentRoute = '';

  navigationItems: NavigationItem[] = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: 'appstore', 
      route: '/digital-maps/overview', 
      roles: ['developer', 'stakeholder', 'integrator'] 
    },
    { 
      id: 'maps', 
      label: 'Digital Maps', 
      icon: 'environment', 
      route: '/digital-maps/maps', 
      roles: ['developer', 'stakeholder', 'integrator'] 
    },
    { 
      id: 'processes', 
      label: 'Process Flows', 
      icon: 'apartment', 
      route: '/digital-maps/processes', 
      roles: ['developer', 'integrator'] 
    },
    { 
      id: 'collaboration', 
      label: 'Collaboration', 
      icon: 'team', 
      route: '/digital-maps/collaboration', 
      roles: ['developer', 'stakeholder', 'integrator'] 
    },
    { 
      id: 'documentation', 
      label: 'Documentation', 
      icon: 'file-text', 
      route: '/digital-maps/documentation', 
      roles: ['developer', 'integrator'] 
    },
    { 
      id: 'assessment', 
      label: 'Assessment', 
      icon: 'audit', 
      route: '/digital-maps/assessment', 
      roles: ['developer', 'stakeholder', 'integrator'] 
    },
    { 
      id: 'agentic-assessment', 
      label: 'AI Agent Assessment', 
      icon: 'robot', 
      route: '/digital-maps/agentic-assessment', 
      roles: ['developer', 'stakeholder', 'integrator'] 
    }
  ];

  get filteredNavItems(): NavigationItem[] {
    return this.navigationItems.filter(item => 
      item.roles.includes(this.userRole)
    );
  }

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        this.currentRoute = navEvent.url;
        this.cdr.markForCheck();
      });
    
    this.currentRoute = this.router.url;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.cdr.markForCheck();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'developer': 
        return 'blue';
      case 'stakeholder': 
        return 'green';
      case 'integrator': 
        return 'purple';
      default: 
        return 'default';
    }
  }

  isAssessmentRoute(): boolean {
    return this.currentRoute.includes('/digital-maps/assessment');
  }
}
