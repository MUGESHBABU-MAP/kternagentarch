import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface Participant {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface Collaboration {
  id: string;
  title: string;
  description: string;
  type: 'map' | 'process' | 'review';
  status: 'active' | 'pending' | 'completed';
  participants: Participant[];
  progress: number;
  comments: number;
  changes: number;
  reviews: number;
  lastActivity: string;
  deadline: string;
}

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  status: 'online' | 'offline';
  lastSeen: string;
  contributions: number;
  reviews: number;
}

interface Activity {
  id: string;
  user: {
    name: string;
    initials: string;
    color: string;
  };
  action: string;
  type: 'comment' | 'edit' | 'review' | 'share';
  description: string;
  timestamp: string;
  project: string;
}

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollaborationComponent implements OnInit {
  selectedTabIndex = 0;

  activeCollaborations: Collaboration[] = [
    {
      id: '1',
      title: 'SAP Finance Module Review',
      description: 'Collaborative review of the finance module digital map with stakeholders and technical team',
      type: 'review',
      status: 'active',
      participants: [
        { id: '1', name: 'Sarah Johnson', initials: 'SJ', color: '#1890ff' },
        { id: '2', name: 'Michael Chen', initials: 'MC', color: '#52c41a' },
        { id: '3', name: 'Emma Wilson', initials: 'EW', color: '#722ed1' },
        { id: '4', name: 'David Brown', initials: 'DB', color: '#faad14' }
      ],
      progress: 75,
      comments: 23,
      changes: 8,
      reviews: 3,
      lastActivity: '2 hours ago',
      deadline: 'Due in 3 days'
    },
    {
      id: '2',
      title: 'Order-to-Cash Process Design',
      description: 'Collaborative design session for the complete order-to-cash business process workflow',
      type: 'process',
      status: 'active',
      participants: [
        { id: '1', name: 'Sarah Johnson', initials: 'SJ', color: '#1890ff' },
        { id: '5', name: 'Lisa Garcia', initials: 'LG', color: '#eb2f96' },
        { id: '6', name: 'James Wilson', initials: 'JW', color: '#13c2c2' }
      ],
      progress: 45,
      comments: 15,
      changes: 12,
      reviews: 1,
      lastActivity: '1 day ago',
      deadline: 'Due in 1 week'
    },
    {
      id: '3',
      title: 'Integration Architecture Map',
      description: 'Technical collaboration on system integration architecture and API design patterns',
      type: 'map',
      status: 'pending',
      participants: [
        { id: '2', name: 'Michael Chen', initials: 'MC', color: '#52c41a' },
        { id: '4', name: 'David Brown', initials: 'DB', color: '#faad14' }
      ],
      progress: 20,
      comments: 7,
      changes: 3,
      reviews: 0,
      lastActivity: '3 days ago',
      deadline: 'Due in 2 weeks'
    },
    {
      id: '4',
      title: 'Procurement Workflow Update',
      description: 'Updating the procurement workflow based on new business requirements and compliance standards',
      type: 'process',
      status: 'completed',
      participants: [
        { id: '3', name: 'Emma Wilson', initials: 'EW', color: '#722ed1' },
        { id: '5', name: 'Lisa Garcia', initials: 'LG', color: '#eb2f96' },
        { id: '6', name: 'James Wilson', initials: 'JW', color: '#13c2c2' },
        { id: '7', name: 'Alex Turner', initials: 'AT', color: '#f759ab' }
      ],
      progress: 100,
      comments: 31,
      changes: 18,
      reviews: 5,
      lastActivity: '1 week ago',
      deadline: 'Completed'
    }
  ];

  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      initials: 'SJ',
      color: '#1890ff',
      role: 'Lead Business Analyst',
      status: 'online',
      lastSeen: '',
      contributions: 45,
      reviews: 12
    },
    {
      id: '2',
      name: 'Michael Chen',
      initials: 'MC',
      color: '#52c41a',
      role: 'Technical Architect',
      status: 'online',
      lastSeen: '',
      contributions: 38,
      reviews: 15
    },
    {
      id: '3',
      name: 'Emma Wilson',
      initials: 'EW',
      color: '#722ed1',
      role: 'Process Designer',
      status: 'offline',
      lastSeen: '2 hours ago',
      contributions: 32,
      reviews: 8
    },
    {
      id: '4',
      name: 'David Brown',
      initials: 'DB',
      color: '#faad14',
      role: 'Integration Specialist',
      status: 'offline',
      lastSeen: '1 day ago',
      contributions: 28,
      reviews: 10
    },
    {
      id: '5',
      name: 'Lisa Garcia',
      initials: 'LG',
      color: '#eb2f96',
      role: 'Stakeholder',
      status: 'online',
      lastSeen: '',
      contributions: 22,
      reviews: 6
    },
    {
      id: '6',
      name: 'James Wilson',
      initials: 'JW',
      color: '#13c2c2',
      role: 'Quality Assurance',
      status: 'offline',
      lastSeen: '3 hours ago',
      contributions: 19,
      reviews: 18
    }
  ];

  recentActivities: Activity[] = [
    {
      id: '1',
      user: { name: 'Sarah Johnson', initials: 'SJ', color: '#1890ff' },
      action: 'commented on',
      type: 'comment',
      description: 'Added feedback on the finance module approval workflow',
      timestamp: '2 hours ago',
      project: 'SAP Finance Module Review'
    },
    {
      id: '2',
      user: { name: 'Michael Chen', initials: 'MC', color: '#52c41a' },
      action: 'updated',
      type: 'edit',
      description: 'Modified the API integration flow diagram',
      timestamp: '4 hours ago',
      project: 'Integration Architecture Map'
    },
    {
      id: '3',
      user: { name: 'Emma Wilson', initials: 'EW', color: '#722ed1' },
      action: 'completed review of',
      type: 'review',
      description: 'Approved the procurement workflow changes',
      timestamp: '1 day ago',
      project: 'Procurement Workflow Update'
    },
    {
      id: '4',
      user: { name: 'David Brown', initials: 'DB', color: '#faad14' },
      action: 'shared',
      type: 'share',
      description: 'Shared the integration map with external consultants',
      timestamp: '2 days ago',
      project: 'Integration Architecture Map'
    },
    {
      id: '5',
      user: { name: 'Lisa Garcia', initials: 'LG', color: '#eb2f96' },
      action: 'commented on',
      type: 'comment',
      description: 'Requested changes to the order processing timeline',
      timestamp: '3 days ago',
      project: 'Order-to-Cash Process Design'
    }
  ];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.cdr.markForCheck();
  }

  getCollaborationIcon(type: string): string {
    switch (type) {
      case 'map': return 'environment';
      case 'process': return 'apartment';
      case 'review': return 'eye';
      default: return 'team';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'map': return 'blue';
      case 'process': return 'green';
      case 'review': return 'orange';
      default: return 'default';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#52c41a';
      case 'pending': return '#faad14';
      case 'completed': return '#1890ff';
      default: return '#8c8c8c';
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#1890ff';
    if (progress >= 25) return '#faad14';
    return '#ff4d4f';
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'comment': return 'blue';
      case 'edit': return 'green';
      case 'review': return 'orange';
      case 'share': return 'purple';
      default: return 'gray';
    }
  }

  getActivityTypeColor(type: string): string {
    switch (type) {
      case 'comment': return 'blue';
      case 'edit': return 'green';
      case 'review': return 'orange';
      case 'share': return 'purple';
      default: return 'default';
    }
  }

  inviteCollaborator(): void {
    this.message.info('Invite collaborator functionality will be implemented');
  }

  createWorkspace(): void {
    this.message.info('Create workspace functionality will be implemented');
  }

  managePermissions(): void {
    this.message.info('Manage permissions functionality will be implemented');
  }

  exportActivity(): void {
    this.message.info('Export activity functionality will be implemented');
  }

  viewAnalytics(): void {
    this.message.info('View analytics functionality will be implemented');
  }

  openCollaboration(collab: Collaboration): void {
    this.message.info(`Opening collaboration: ${collab.title}`);
  }

  editCollaboration(collab: Collaboration, event: Event): void {
    event.stopPropagation();
    this.message.info(`Editing collaboration: ${collab.title}`);
  }

  shareCollaboration(collab: Collaboration, event: Event): void {
    event.stopPropagation();
    this.message.success(`Collaboration "${collab.title}" shared successfully`);
  }

  duplicateCollaboration(collab: Collaboration, event: Event): void {
    event.stopPropagation();
    this.message.success(`Collaboration "${collab.title}" duplicated successfully`);
  }

  archiveCollaboration(collab: Collaboration, event: Event): void {
    event.stopPropagation();
    this.message.success(`Collaboration "${collab.title}" archived successfully`);
  }

  messageUser(member: TeamMember): void {
    this.message.info(`Opening chat with ${member.name}`);
  }

  viewProfile(member: TeamMember): void {
    this.message.info(`Viewing profile of ${member.name}`);
  }

  manageUserPermissions(member: TeamMember): void {
    this.message.info(`Managing permissions for ${member.name}`);
  }
}
