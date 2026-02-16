import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Device,
  CommandRequest,
  DeviceEvent,
  MessageRequest,
} from '../models/device.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ApiResponse<Device[]>>(`${environment.apiUrl}/api/devices`, {
      withCredentials: true,
    });
  }

  getOnline() {
    return this.http.get<ApiResponse<Device[]>>(`${environment.apiUrl}/api/devices/online`, {
      withCredentials: true,
    });
  }

  getDevice(deviceId: string) {
    return this.http.get<ApiResponse<Device>>(`${environment.apiUrl}/api/devices/${deviceId}`, {
      withCredentials: true,
    });
  }

  sendCommand(deviceId: string, command: CommandRequest) {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/api/devices/${deviceId}/command`, command, {
      withCredentials: true,
    });
  }

  sendMessage(deviceId: string, request: MessageRequest) {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/api/devices/${deviceId}/message`, request, {
      withCredentials: true,
    });
  }

  sendCommandToAll(command: CommandRequest) {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/api/devices/command`, command, {
      withCredentials: true,
    });
  }

  sendMessageToAll(request: MessageRequest) {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/api/devices/message`, request, {
      withCredentials: true,
    });
  }

  getEvents(deviceId: string, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<DeviceEvent>>>(
      `${environment.apiUrl}/api/devices/${deviceId}/events`,
      { withCredentials: true, params },
    );
  }
}
