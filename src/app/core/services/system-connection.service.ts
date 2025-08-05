import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ConnectionType {
  id: string;
  name: string;
  description: string;
}

export interface SystemInfo {
  version: string;
  destination: string;
  client: string;
  status: 'connected' | 'disconnected';
}

export interface ConnectionRequest {
  type: string;
  credentials?: {
    username?: string;
    password?: string;
    server?: string;
    port?: number;
  };
  template?: File;
}

@Injectable({
  providedIn: 'root'
})
export class SystemConnectionService {
  private connectionStatusSubject = new BehaviorSubject<SystemInfo | null>(null);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private connectionTypes: ConnectionType[] = [
    {
      id: 'vpn',
      name: 'VPN',
      description: 'Connect using OpenVPN with credentials'
    },
    {
      id: 'ipsec',
      name: 'IPSec',
      description: 'Upload template or fill sample configuration'
    },
    {
      id: 'ktern-connector',
      name: 'KTern Connector',
      description: 'Install and configure KTern Connector'
    }
  ];

  getConnectionTypes(): Observable<ConnectionType[]> {
    return of(this.connectionTypes).pipe(delay(500));
  }

  connect(request: ConnectionRequest): Observable<SystemInfo> {
    // Simulate connection process
    const mockSystemInfo: SystemInfo = {
      version: 'SAP ECC 6.0 EHP8',
      destination: 'PRD_100',
      client: '100',
      status: 'connected'
    };

    this.connectionStatusSubject.next(mockSystemInfo);
    return of(mockSystemInfo).pipe(delay(3000));
  }

  checkConnection(): Observable<boolean> {
    const currentValue = this.connectionStatusSubject.value;
    const isConnected = currentValue ? currentValue.status === 'connected' : false;
    return of(isConnected).pipe(delay(1000));
  }

  disconnect(): Observable<boolean> {
    this.connectionStatusSubject.next(null);
    return of(true).pipe(delay(1000));
  }

  getCurrentConnection(): SystemInfo | null {
    return this.connectionStatusSubject.value;
  }
}
