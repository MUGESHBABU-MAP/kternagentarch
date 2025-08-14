import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AIHelperService } from '../../core/services/ai-helper.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.less']
})
export class MainLayoutComponent {
  sidebarCollapsed = true;
  currentRoute = '';

  navigationItems: NavigationItem[] = [
    { label: 'Digital Maps', icon: 'project', route: '/digital-maps/overview' },
    { label: 'Process Flows', icon: 'fork', route: '/digital-maps/processes' },
    { label: 'Maps', icon: 'environment', route: '/digital-maps/maps' },
    { label: 'Collaboration', icon: 'team', route: '/digital-maps/collaboration' },
    { label: 'Documentation', icon: 'file-text', route: '/digital-maps/documentation' },
    { label: 'Assessment', icon: 'audit', route: '/digital-maps/assessment' },
    { label: 'Agent Hub', icon: 'robot', route: '/agents/hub' },
    { label: 'My Agents', icon: 'user', route: '/agents/my-agents' },
    { label: 'Pinned Agents', icon: 'pushpin', route: '/agents/pinned' },
    { label: 'Agent Progress', icon: 'line-chart', route: '/agents/progress' },
    { label: 'Agentic Assessment', icon: 'safety-certificate', route: '/agentic-assessment/orchestration' },
  ];

  constructor(
    private router: Router,
    public aiHelper: AIHelperService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isAssessmentRoute(): boolean {
    return this.currentRoute.includes('/assessment/');
  }

  isRouteActive(route: string): boolean {
    // Handle special case for root routes
    if (route === '/digital-maps/overview') {
      return this.currentRoute === '/digital-maps' || this.currentRoute.startsWith(route);
    }
    return this.currentRoute === route || 
           (route !== '/' && this.currentRoute.startsWith(route + '/'));
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      admin: 'red',
      developer: 'blue',
      user: 'default'
    };
    return colors[role.toLowerCase()] || 'default';
  }
}
