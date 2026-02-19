import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface WebSocketSecretResponse {
  secretKey: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WsSecretService {
  private readonly base = `${environment.apiUrl}/api/ws-secret`;

  constructor(private http: HttpClient) {}

  getSecret() {
    return this.http.get<ApiResponse<WebSocketSecretResponse>>(this.base, {
      withCredentials: true,
    });
  }

  generateKey() {
    return this.http.post<ApiResponse<WebSocketSecretResponse>>(
      `${this.base}/generate`,
      {},
      { withCredentials: true },
    );
  }

  renewKey() {
    return this.http.post<ApiResponse<WebSocketSecretResponse>>(
      `${this.base}/renew`,
      {},
      { withCredentials: true },
    );
  }
}
