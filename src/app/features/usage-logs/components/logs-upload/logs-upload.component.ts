import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadFile, UploadChangeParam } from 'ng-zorro-antd/upload';
import { LogsService, LogEntry, LogsUploadResult } from '@core/services/logs.service';

@Component({
  selector: 'app-logs-upload',
  templateUrl: './logs-upload.component.html',
  styleUrls: ['./logs-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsUploadComponent {
  @Output() uploadComplete = new EventEmitter<LogEntry[]>();
  @Output() backToSelection = new EventEmitter<void>();

  uploadForm: FormGroup;
  fileList: UploadFile[] = [];
  uploading = false;
  uploadResult: LogsUploadResult | null = null;

  constructor(
    private fb: FormBuilder,
    private logsService: LogsService,
    private cdr: ChangeDetectorRef
  ) {
    this.uploadForm = this.fb.group({
      description: ['', [Validators.maxLength(500)]]
    });
  }

  beforeUpload = (file: UploadFile): boolean => {
    const isValidType = this.isValidFileType(file);
    const isValidSize = file.size! / 1024 / 1024 < 50; // 50MB limit per file
    
    if (!isValidType) {
      console.error('Invalid file type. Please upload CSV, Excel, or text files.');
      return false;
    }

    if (!isValidSize) {
      console.error('File size must be less than 50MB.');
      return false;
    }

    // Check file count limit
    if (this.fileList.length >= 50) {
      console.error('Maximum 50 files allowed.');
      return false;
    }

    // Check total size limit (5GB = 5 * 1024 * 1024 * 1024 bytes)
    const currentTotalSize = this.getTotalSize();
    const maxTotalSize = 5 * 1024 * 1024 * 1024; // 5GB
    
    if (currentTotalSize + file.size! > maxTotalSize) {
      console.error('Total file size cannot exceed 5GB.');
      return false;
    }

    // Add file to list
    this.fileList = [...this.fileList, file];
    return false; // Prevent automatic upload
  };

  private isValidFileType(file: UploadFile): boolean {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    const validExtensions = ['.csv', '.xls', '.xlsx', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return validTypes.includes(file.type!) || validExtensions.includes(fileExtension);
  }

  handleUpload(): void {
    if (this.fileList.length === 0) {
      return;
    }

    this.uploading = true;
    this.uploadResult = null;
    this.cdr.detectChanges();

    // For multiple files, we'll process them all
    // For now, using the first file as example - in real implementation, 
    // you'd process all files in the fileList
    const file = this.fileList[0];
    
    this.logsService.uploadLogs(file as any).subscribe({
      next: (result: LogsUploadResult) => {
        this.uploading = false;
        this.uploadResult = result;
        this.cdr.detectChanges();

        if (result.success) {
          // Simulate getting logs after successful upload
          this.logsService.getLogs().subscribe(logs => {
            this.uploadComplete.emit(logs);
          });
        }
      },
      error: (error) => {
        this.uploading = false;
        this.uploadResult = {
          success: false,
          fileName: file.name,
          recordCount: 0,
          message: 'Upload failed. Please try again.'
        };
        this.cdr.detectChanges();
      }
    });
  }

  removeFile(): void {
    this.fileList = [];
    this.uploadResult = null;
  }

  removeFileAt(index: number): void {
    this.fileList = this.fileList.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  getTotalSize(): number {
    return this.fileList.reduce((total, file) => total + (file.size || 0), 0);
  }

  getTotalSizeFormatted(): string {
    const totalBytes = this.getTotalSize();
    return this.formatFileSize(totalBytes);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onBack(): void {
    this.backToSelection.emit();
  }

  handleChange(info: UploadChangeParam): void {
    // Handle upload change events if needed
  }

  getResultDescription(): string {
    if (!this.uploadResult) {
      return '';
    }

    if (this.uploadResult.success) {
      return `File "${this.uploadResult.fileName}" processed successfully. ${this.uploadResult.recordCount} records imported. ${this.uploadResult.message}`;
    } else {
      return this.uploadResult.message;
    }
  }
}
