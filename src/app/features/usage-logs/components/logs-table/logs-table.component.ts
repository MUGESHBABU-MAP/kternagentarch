import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LogEntry } from '@core/services/logs.service';

interface ExtendedLogEntry extends LogEntry {
  period?: string;
  fetchTime?: number;
}

@Component({
  selector: 'app-logs-table',
  templateUrl: './logs-table.component.html',
  styleUrls: ['./logs-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsTableComponent {
  @Input() logs: LogEntry[] = [];

  displayedColumns = [
    { key: 'period', title: 'Period', sortable: true },
    { key: 'module', title: 'Module', sortable: true },
    { key: 'transactions', title: 'Transactions', sortable: true },
    { key: 'users', title: 'Users', sortable: true },
    { key: 'fetchTime', title: 'Fetch Time (ms)', sortable: true }
  ];

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  viewMode: 'monthly' | 'weekly' = 'monthly';
  selectedDate: Date | null = null;
  fetchStartTime: number = Date.now();

  constructor(private cdr: ChangeDetectorRef) {}

  getSortedLogs(): LogEntry[] {
    if (!this.sortColumn) {
      return this.logs;
    }

    return [...this.logs].sort((a, b) => {
      const aValue = a[this.sortColumn as keyof LogEntry];
      const bValue = b[this.sortColumn as keyof LogEntry];

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'swap';
    }
    return this.sortDirection === 'asc' ? 'caret-up' : 'caret-down';
  }

  getTotalTransactions(): number {
    return this.logs.reduce((total, log) => total + log.transactions, 0);
  }

  getTotalUsers(): number {
    const uniqueUsers = new Set();
    this.logs.forEach(log => {
      for (let i = 0; i < log.users; i++) {
        uniqueUsers.add(`${log.module}-user-${i}`);
      }
    });
    return uniqueUsers.size;
  }

  getAverageResponseTime(): number {
    if (this.logs.length === 0) return 0;
    const total = this.logs.reduce((sum, log) => sum + log.responseTime, 0);
    return Math.round((total / this.logs.length) * 100) / 100;
  }

  getModuleColor(module: string): string {
    const colors: { [key: string]: string } = {
      'FI': '#1890ff',
      'MM': '#52c41a',
      'SD': '#fa8c16',
      'HR': '#eb2f96',
      'PP': '#722ed1',
      'QM': '#13c2c2'
    };
    return colors[module] || '#8c8c8c';
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getFetchTime(): string {
    const fetchTime = Date.now() - this.fetchStartTime;
    return `${fetchTime}ms`;
  }

  onViewModeChange(): void {
    this.selectedDate = null;
    this.cdr.detectChanges();
  }

  onDateFilterChange(): void {
    // Filter logs based on selected date when in weekly view
    this.cdr.detectChanges();
  }

  getGroupedLogs(): LogEntry[] {
    if (this.viewMode === 'monthly') {
      return this.getMonthlyGroupedLogs();
    } else {
      return this.getWeeklyGroupedLogs();
    }
  }

  private getMonthlyGroupedLogs(): LogEntry[] {
    const grouped = new Map<string, ExtendedLogEntry>();
    
    this.logs.forEach(log => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (grouped.has(monthKey)) {
        const existing = grouped.get(monthKey)!;
        existing.transactions += log.transactions;
        existing.users += log.users;
        existing.responseTime = (existing.responseTime + log.responseTime) / 2;
      } else {
        const extendedLog: ExtendedLogEntry = {
          ...log,
          date: monthKey,
          period: this.formatMonthPeriod(monthKey)
        };
        grouped.set(monthKey, extendedLog);
      }
    });
    
    return Array.from(grouped.values());
  }

  private getWeeklyGroupedLogs(): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (this.selectedDate) {
      const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
      filteredLogs = this.logs.filter(log => log.date === selectedDateStr);
    }
    
    const grouped = new Map<string, ExtendedLogEntry>();
    
    filteredLogs.forEach(log => {
      const date = new Date(log.date);
      const weekKey = this.getWeekKey(date);
      
      if (grouped.has(weekKey)) {
        const existing = grouped.get(weekKey)!;
        existing.transactions += log.transactions;
        existing.users += log.users;
        existing.responseTime = (existing.responseTime + log.responseTime) / 2;
      } else {
        const extendedLog: ExtendedLogEntry = {
          ...log,
          date: weekKey,
          period: this.formatWeekPeriod(weekKey)
        };
        grouped.set(weekKey, extendedLog);
      }
    });
    
    return Array.from(grouped.values());
  }

  private getWeekKey(date: Date): string {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
  }

  private formatMonthPeriod(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  private formatWeekPeriod(weekKey: string): string {
    const startDate = new Date(weekKey);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
}
