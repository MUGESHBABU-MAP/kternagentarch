import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LogEntry {
  date: string;
  module: string;
  transactions: number;
  users: number;
  responseTime: number;
}

export interface LogsUploadResult {
  success: boolean;
  fileName: string;
  recordCount: number;
  message: string;
}

export interface LogsFetchStatus {
  status: 'idle' | 'fetching' | 'completed' | 'error';
  progress: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private fetchStatusSubject = new BehaviorSubject<LogsFetchStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  public fetchStatus$ = this.fetchStatusSubject.asObservable();

  private mockLogs: LogEntry[] = [
    { date: '2024-01', module: 'FI', transactions: 15420, users: 45, responseTime: 1.2 },
    { date: '2024-02', module: 'FI', transactions: 16890, users: 48, responseTime: 1.1 },
    { date: '2024-03', module: 'FI', transactions: 14560, users: 42, responseTime: 1.3 },
    { date: '2024-01', module: 'MM', transactions: 8920, users: 28, responseTime: 0.9 },
    { date: '2024-02', module: 'MM', transactions: 9340, users: 30, responseTime: 0.8 },
    { date: '2024-03', module: 'MM', transactions: 8750, users: 27, responseTime: 1.0 },
    { date: '2024-01', module: 'SD', transactions: 12340, users: 35, responseTime: 1.4 },
    { date: '2024-02', module: 'SD', transactions: 13120, users: 38, responseTime: 1.3 },
    { date: '2024-03', module: 'SD', transactions: 11890, users: 33, responseTime: 1.5 },
    { date: '2024-01', module: 'HR', transactions: 5670, users: 18, responseTime: 0.7 },
    { date: '2024-02', module: 'HR', transactions: 6120, users: 20, responseTime: 0.6 },
    { date: '2024-03', module: 'HR', transactions: 5890, users: 19, responseTime: 0.8 }
  ];

  uploadLogs(file: File): Observable<LogsUploadResult> {
    const result: LogsUploadResult = {
      success: true,
      fileName: file.name,
      recordCount: Math.floor(Math.random() * 1000) + 500,
      message: 'Logs uploaded and processed successfully'
    };

    return of(result).pipe(delay(2000));
  }

  fetchLogs(): Observable<LogEntry[]> {
    // Simulate progressive fetching
    this.simulateFetchProgress();
    return of(this.mockLogs).pipe(delay(5000));
  }

  getLogs(): Observable<LogEntry[]> {
    return of(this.mockLogs).pipe(delay(500));
  }

  getLogsByMonth(month: string): Observable<LogEntry[]> {
    const filtered = this.mockLogs.filter(log => log.date === month);
    return of(filtered).pipe(delay(300));
  }

  private simulateFetchProgress(): void {
    const steps = [
      { progress: 10, message: 'Connecting to SAP system...' },
      { progress: 25, message: 'Authenticating...' },
      { progress: 40, message: 'Fetching transaction logs...' },
      { progress: 60, message: 'Processing user data...' },
      { progress: 80, message: 'Analyzing performance metrics...' },
      { progress: 100, message: 'Fetch completed successfully' }
    ];

    this.fetchStatusSubject.next({
      status: 'fetching',
      progress: 0,
      message: 'Starting fetch process...'
    });

    steps.forEach((step, index) => {
      setTimeout(() => {
        this.fetchStatusSubject.next({
          status: index === steps.length - 1 ? 'completed' : 'fetching',
          progress: step.progress,
          message: step.message
        });
      }, (index + 1) * 800);
    });
  }

  resetFetchStatus(): void {
    this.fetchStatusSubject.next({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }
}
