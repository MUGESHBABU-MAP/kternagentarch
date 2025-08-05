import { Component, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogsService, LogEntry, LogsFetchStatus } from '@core/services/logs.service';

@Component({
  selector: 'app-logs-fetch',
  templateUrl: './logs-fetch.component.html',
  styleUrls: ['./logs-fetch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsFetchComponent implements OnInit, OnDestroy {
  @Output() fetchComplete = new EventEmitter<LogEntry[]>();
  @Output() backToSelection = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  fetchForm: FormGroup;
  fetchStatus: LogsFetchStatus = { status: 'idle', progress: 0, message: '' };
  isFetching = false;

  dateRangeOptions = [
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 60 days', value: '60' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last 6 months', value: '180' },
    { label: 'Last 12 months', value: '365' },
    { label: 'Custom range', value: 'custom' }
  ];

  moduleOptions = [
    { label: 'All Modules', value: 'all' },
    { label: 'Financial Accounting (FI)', value: 'FI' },
    { label: 'Materials Management (MM)', value: 'MM' },
    { label: 'Sales & Distribution (SD)', value: 'SD' },
    { label: 'Human Resources (HR)', value: 'HR' },
    { label: 'Production Planning (PP)', value: 'PP' },
    { label: 'Quality Management (QM)', value: 'QM' }
  ];

  constructor(
    private fb: FormBuilder,
    private logsService: LogsService,
    private cdr: ChangeDetectorRef
  ) {
    this.fetchForm = this.fb.group({
      dateRange: ['90', Validators.required],
      customStartDate: [null],
      customEndDate: [null],
      modules: [['all'], Validators.required],
      includeUserDetails: [true],
      includePerformanceMetrics: [true],
      maxRecords: [10000, [Validators.min(100), Validators.max(50000)]]
    });
  }

  ngOnInit(): void {
    this.logsService.fetchStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.fetchStatus = status;
        this.isFetching = status.status === 'fetching';
        this.cdr.detectChanges();

        if (status.status === 'completed') {
          this.onFetchCompleted();
        }
      });

    // Watch for date range changes
    const dateRangeControl = this.fetchForm.get('dateRange');
    if (dateRangeControl) {
      dateRangeControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          const customDateControls = ['customStartDate', 'customEndDate'];
          if (value === 'custom') {
            customDateControls.forEach(controlName => {
              const control = this.fetchForm.get(controlName);
              if (control) {
                control.setValidators([Validators.required]);
                control.updateValueAndValidity();
              }
            });
          } else {
            customDateControls.forEach(controlName => {
              const control = this.fetchForm.get(controlName);
              if (control) {
                control.clearValidators();
                control.updateValueAndValidity();
              }
            });
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startFetch(): void {
    if (this.fetchForm.invalid || this.isFetching) {
      return;
    }

    this.logsService.fetchLogs().subscribe({
      next: (logs: LogEntry[]) => {
        // The completion is handled by the status subscription
      },
      error: (error: any) => {
        this.isFetching = false;
        this.fetchStatus = {
          status: 'error',
          progress: 0,
          message: 'Failed to fetch logs. Please check your connection and try again.'
        };
        this.cdr.detectChanges();
      }
    });
  }

  private onFetchCompleted(): void {
    this.logsService.getLogs().subscribe(logs => {
      this.fetchComplete.emit(logs);
    });
  }

  cancelFetch(): void {
    this.logsService.resetFetchStatus();
    this.isFetching = false;
    this.cdr.detectChanges();
  }

  onBack(): void {
    this.backToSelection.emit();
  }

  isCustomDateRange(): boolean {
    const dateRangeControl = this.fetchForm.get('dateRange');
    return dateRangeControl ? dateRangeControl.value === 'custom' : false;
  }

  getProgressColor(): string {
    if (this.fetchStatus.status === 'error') return '#ff4d4f';
    if (this.fetchStatus.status === 'completed') return '#52c41a';
    return '#1890ff';
  }
}
