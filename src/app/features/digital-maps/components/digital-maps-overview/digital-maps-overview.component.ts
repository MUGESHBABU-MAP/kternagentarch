import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendIcon: string;
  color: string;
}

interface RecentActivity {
  title: string;
  description: string;
  time: string;
  icon: string;
  status: string;
}

interface TeamActivity {
  name: string;
  initials: string;
  action: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-digital-maps-overview',
  templateUrl: './digital-maps-overview.component.html',
  styleUrls: ['./digital-maps-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DigitalMapsOverviewComponent implements OnInit {
  userRole: 'developer' | 'stakeholder' | 'integrator' = 'developer';

  statsCards: StatCard[] = [
    {
      title: 'Total Maps',
      value: '24',
      icon: 'environment',
      trend: '+12% from last month',
      trendIcon: 'rise',
      color: '#1890ff'
    },
    {
      title: 'Active Processes',
      value: '8',
      icon: 'apartment',
      trend: 'All systems operational',
      trendIcon: 'check-circle',
      color: '#52c41a'
    },
    {
      title: 'Team Members',
      value: '12',
      icon: 'team',
      trend: '3 active now',
      trendIcon: 'user',
      color: '#722ed1'
    },
    {
      title: 'Pending Reviews',
      value: '3',
      icon: 'clock-circle',
      trend: 'Action required',
      trendIcon: 'exclamation-circle',
      color: '#faad14'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      title: 'SAP S/4HANA Finance',
      description: 'Updated 2 hours ago',
      time: '2 hours ago',
      icon: 'environment',
      status: 'Active'
    },
    {
      title: 'Order-to-Cash Process',
      description: 'Updated 1 day ago',
      time: '1 day ago',
      icon: 'apartment',
      status: 'Active'
    },
    {
      title: 'Integration Mapping',
      description: 'Updated 3 days ago',
      time: '3 days ago',
      icon: 'environment',
      status: 'Draft'
    }
  ];

  teamActivities: TeamActivity[] = [
    {
      name: 'Sarah Johnson',
      initials: 'SJ',
      action: 'Sarah Johnson commented on Finance Module',
      time: '2 hours ago',
      color: '#1890ff'
    },
    {
      name: 'Michael Chen',
      initials: 'MC',
      action: 'Michael Chen updated Order-to-Cash process',
      time: '1 day ago',
      color: '#52c41a'
    },
    {
      name: 'Emma Wilson',
      initials: 'EW',
      action: 'Emma Wilson created new process map',
      time: '3 days ago',
      color: '#722ed1'
    }
  ];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': 
        return '#52c41a';
      case 'draft': 
        return '#faad14';
      case 'archived': 
        return '#8c8c8c';
      default: 
        return '#8c8c8c';
    }
  }

  navigateToMaps(): void {
    this.router.navigate(['/digital-maps/maps']);
  }

  navigateToProcesses(): void {
    this.router.navigate(['/digital-maps/processes']);
  }

  navigateToCollaboration(): void {
    this.router.navigate(['/digital-maps/collaboration']);
  }
}
