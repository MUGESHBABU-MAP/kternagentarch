import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogsService, LogEntry } from '@core/services/logs.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-usage-logs',
  templateUrl: './usage-logs.component.html',
  styleUrls: ['./usage-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageLogsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentStep = 'selection'; // 'selection', 'upload', 'fetch', 'results'
  logs: LogEntry[] = [];
  isLoading = false;

  constructor(
    private logsService: LogsService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Reset fetch status when component initializes
    this.logsService.resetFetchStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMethodSelected(method: 'upload' | 'fetch'): void {
    this.currentStep = method;
  }

  onUploadComplete(logs: LogEntry[]): void {
    this.logs = logs;
    this.currentStep = 'results';
  }

  onFetchComplete(logs: LogEntry[]): void {
    this.logs = logs;
    this.currentStep = 'results';
  }

  onBackToSelection(): void {
    this.currentStep = 'selection';
    this.logs = [];
    this.logsService.resetFetchStatus();
  }

  onNext(): void {
    if (this.logs.length > 0) {
      this.message.success('Usage logs processed successfully! Proceeding to assessment selection...');
      this.router.navigate(['/digital-maps/assessment/selection']);
    } else {
      this.message.warning('Please collect usage logs before proceeding');
    }
  }
}
