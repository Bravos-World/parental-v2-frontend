import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { DeviceService } from '../../core/services/device.service';
import { Device, CommandType, CommandRequest } from '../../core/models/device.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../shared/services/toast.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatusBadgeComponent, FormsModule],
  template: `
    <div class="dashboard">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">{{ i18n.t('dashboard.title') }}</h1>
        <p class="page-desc">{{ i18n.t('dashboard.desc') }}</p>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card glass-card-sm">
          <div class="stat-icon-wrap stat-icon-blue">
            <span class="stat-icon">🖥️</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ devices().length }}</span>
            <span class="stat-label">{{ i18n.t('dashboard.total_devices') }}</span>
          </div>
        </div>
        <div class="stat-card glass-card-sm">
          <div class="stat-icon-wrap stat-icon-green">
            <span class="stat-icon">🟢</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ onlineCount() }}</span>
            <span class="stat-label">{{ i18n.t('dashboard.online') }}</span>
          </div>
        </div>
        <div class="stat-card glass-card-sm">
          <div class="stat-icon-wrap stat-icon-gray">
            <span class="stat-icon">⚫</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ devices().length - onlineCount() }}</span>
            <span class="stat-label">{{ i18n.t('dashboard.offline') }}</span>
          </div>
        </div>
        <div class="stat-card glass-card-sm">
          <div class="stat-icon-wrap stat-icon-red">
            <span class="stat-icon">🔒</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ lockedCount() }}</span>
            <span class="stat-label">{{ i18n.t('dashboard.locked') }}</span>
          </div>
        </div>
      </div>

      <!-- Broadcast Actions -->
      <div class="broadcast-section glass-card-sm">
        <h3 class="section-title">{{ i18n.t('dashboard.broadcast_title') }}</h3>
        <div class="broadcast-delay">
          <label class="broadcast-label">{{ i18n.t('dashboard.delay') }}</label>
          <div class="delay-presets">
            @for (preset of delayPresets; track preset.key) {
              <button
                class="preset-btn"
                [class.preset-active]="selectedPreset === preset.key"
                (click)="selectPreset(preset)"
              >
                {{ i18n.t(preset.key) }}
              </button>
            }
          </div>
          @if (selectedPreset === 'delay.custom') {
            <div class="custom-delay">
              <input
                type="number"
                class="input-field custom-delay-input"
                [(ngModel)]="customDelayValue"
                (ngModelChange)="updateCustomDelay()"
                min="0"
                [placeholder]="i18n.t('delay.enter_value')"
              />
              <select
                class="input-field time-unit-select"
                [(ngModel)]="timeUnit"
                (ngModelChange)="updateCustomDelay()"
              >
                <option value="minutes">{{ i18n.t('delay.minutes') }}</option>
                <option value="hours">{{ i18n.t('delay.hours') }}</option>
              </select>
            </div>
          }
          <p class="delay-hint">⏱️ {{ formatDelay(broadcastDelay) }}</p>
        </div>
        <div class="broadcast-actions">
          <button class="btn btn-danger btn-sm" (click)="broadcastCommand('LOCK')">🔒 {{ i18n.t('dashboard.lock_all') }}</button>
          <button class="btn btn-success btn-sm" (click)="broadcastCommand('UNLOCK')">🔓 {{ i18n.t('dashboard.unlock_all') }}</button>
          <button class="btn btn-warning btn-sm" (click)="broadcastCommand('SHUTDOWN')">⏻ {{ i18n.t('dashboard.shutdown_all') }}</button>
          <button class="btn btn-ghost btn-sm" (click)="broadcastCommand('RESTART')">🔄 {{ i18n.t('dashboard.restart_all') }}</button>
        </div>
      </div>

      <!-- Devices Grid -->
      <div class="devices-section">
        <h3 class="section-title">{{ i18n.t('dashboard.devices_title') }}</h3>

        @if (loading()) {
          <div class="loading-state">
            <span class="spinner-lg"></span>
            <p>{{ i18n.t('dashboard.loading') }}</p>
          </div>
        } @else if (devices().length === 0) {
          <div class="empty-state glass-card-sm">
            <span class="empty-icon">📡</span>
            <h3>{{ i18n.t('dashboard.empty_title') }}</h3>
            <p>{{ i18n.t('dashboard.empty_desc') }}</p>
          </div>
        } @else {
          <div class="device-grid">
            @for (device of devices(); track device.deviceId) {
              <div class="device-card glass-card-sm">
                <div class="device-card-header" (click)="navigateToDevice(device.deviceId)">
                  <span class="device-name">{{ device.deviceName }}</span>
                  <app-status-badge
                    [variant]="device.status === 'ONLINE' ? 'online' : 'offline'"
                    [label]="device.status"
                  />
                </div>
                <div class="device-card-body" (click)="navigateToDevice(device.deviceId)">
                  <div class="device-info-row">
                    <span class="device-info-label">{{ i18n.t('dashboard.ip') }}</span>
                    <span class="device-info-value">{{ device.ipAddress }}</span>
                  </div>
                  <div class="device-info-row">
                    <span class="device-info-label">{{ i18n.t('dashboard.lock_status') }}</span>
                    <app-status-badge
                      [variant]="device.lockStatus === 'LOCKED' ? 'locked' : 'unlocked'"
                      [label]="device.lockStatus"
                    />
                  </div>
                  <div class="device-info-row">
                    <span class="device-info-label">{{ i18n.t('dashboard.last_seen') }}</span>
                    <span class="device-info-value muted">{{ formatTime(device.lastSeen) }}</span>
                  </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="device-quick-actions">
                  @if (device.status === 'ONLINE') {
                    <button 
                      class="quick-action-btn lock-btn" 
                      (click)="lockDeviceNow(device.deviceId, $event)"
                      title="{{ i18n.t('dashboard.lock_now') }}"
                    >
                      🔒 {{ i18n.t('dashboard.lock_now') }}
                    </button>
                    <button 
                      class="quick-action-btn unlock-btn" 
                      (click)="openUnlockModal(device.deviceId, $event)"
                      title="{{ i18n.t('dashboard.unlock_temp') }}"
                    >
                      🔓 {{ i18n.t('dashboard.unlock_temp') }}
                    </button>
                  }
                  @if (device.status === 'OFFLINE') {
                    <button 
                      class="quick-action-btn delete-btn" 
                      (click)="deleteDevice(device.deviceId, $event)"
                      title="{{ i18n.t('dashboard.delete_device') }}"
                    >
                      🗑️ {{ i18n.t('dashboard.delete_device') }}
                    </button>
                  }
                </div>

                <div class="device-card-footer" (click)="navigateToDevice(device.deviceId)">
                  <span class="arrow-hint">{{ i18n.t('dashboard.view_details') }}</span>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Unlock Duration Modal -->
      @if (showUnlockModal()) {
        <div class="modal-overlay" (click)="closeUnlockModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ i18n.t('dashboard.unlock_temp') }}</h3>
              <button class="modal-close" (click)="closeUnlockModal()">✕</button>
            </div>
            <div class="modal-body">
              <label class="modal-label">{{ i18n.t('dashboard.unlock_for') }}</label>
              <div class="unlock-presets">
                @for (preset of unlockPresets; track preset.key) {
                  <button
                    class="preset-btn"
                    [class.preset-active]="selectedUnlockPreset === preset.key"
                    (click)="selectUnlockPreset(preset)"
                  >
                    {{ i18n.t(preset.key) }}
                  </button>
                }
              </div>
              @if (selectedUnlockPreset === 'delay.custom') {
                <div class="custom-delay">
                  <input
                    type="number"
                    class="input-field custom-delay-input"
                    [(ngModel)]="customUnlockValue"
                    (ngModelChange)="updateCustomUnlock()"
                    min="1"
                    [placeholder]="i18n.t('delay.enter_value')"
                  />
                  <select
                    class="input-field time-unit-select"
                    [(ngModel)]="unlockTimeUnit"
                    (ngModelChange)="updateCustomUnlock()"
                  >
                    <option value="minutes">{{ i18n.t('delay.minutes') }}</option>
                    <option value="hours">{{ i18n.t('delay.hours') }}</option>
                  </select>
                </div>
              }
              <p class="delay-hint">⏱️ {{ formatDelay(unlockDuration) }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost btn-sm" (click)="closeUnlockModal()">Hủy</button>
              <button class="btn btn-success btn-sm" (click)="confirmUnlock()">Xác nhận</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .dashboard {
      max-width: 1200px;
    }

    .page-header {
      margin-bottom: 28px;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .page-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .stat-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .stat-icon-blue { background: rgba(59, 130, 246, 0.12); }
    .stat-icon-green { background: rgba(34, 197, 94, 0.12); }
    .stat-icon-gray { background: rgba(100, 116, 139, 0.12); }
    .stat-icon-red { background: rgba(239, 68, 68, 0.12); }

    .stat-icon {
      font-size: 1.4rem;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Broadcast */
    .broadcast-section {
      padding: 20px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    .broadcast-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .broadcast-delay {
      margin-bottom: 14px;
    }

    .broadcast-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .delay-presets, .unlock-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .preset-btn {
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 50px;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .preset-btn:hover {
      border-color: var(--accent-blue);
      color: var(--text-primary);
    }

    .preset-active {
      background: rgba(59, 130, 246, 0.2) !important;
      border-color: var(--accent-blue) !important;
      color: var(--accent-blue) !important;
    }

    .custom-delay {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
    }

    .custom-delay-input {
      flex: 1;
      max-width: 150px;
    }

    .time-unit-select {
      width: 120px;
      cursor: pointer;
    }

    .delay-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Device Grid */
    .device-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .device-card {
      padding: 20px;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
    }

    .device-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--border-active);
    }

    .device-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      cursor: pointer;
    }

    .device-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .device-card-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
    }

    .device-info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .device-info-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .device-info-value {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .device-info-value.muted {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Quick Actions */
    .device-quick-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }

    .quick-action-btn {
      flex: 1;
      padding: 8px 12px;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .quick-action-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .lock-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--accent-red);
      color: var(--accent-red);
    }

    .unlock-btn:hover {
      background: rgba(34, 197, 94, 0.1);
      border-color: var(--accent-green);
      color: var(--accent-green);
    }

    .delete-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--accent-red);
      color: var(--accent-red);
    }

    .device-card-footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      cursor: pointer;
    }

    .arrow-hint {
      font-size: 0.8rem;
      color: var(--accent-blue);
      font-weight: 500;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 500px;
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .modal-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 20px;
    }

    .modal-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid var(--border-color);
    }

    /* Loading / Empty */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 60px 20px;
      color: var(--text-muted);
    }

    .spinner-lg {
      width: 32px;
      height: 32px;
      border: 3px solid var(--bg-tertiary);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .empty-state p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .device-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        width: 95%;
      }
    }

    @media (max-width: 480px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .quick-action-btn {
        font-size: 0.7rem;
        padding: 6px 8px;
      }
    }
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private pollSub?: Subscription;
  i18n = inject(I18nService);

  devices = signal<Device[]>([]);
  loading = signal(true);
  onlineCount = signal(0);
  lockedCount = signal(0);

  // Modal state
  showUnlockModal = signal(false);
  selectedDeviceId = '';

  ngOnInit() {
    this.loadDevices();
    this.pollSub = interval(10_000).subscribe(() => this.loadDevices());
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadDevices() {
    this.deviceService.getAll().subscribe({
      next: (res) => {
        if (res.data) {
          this.devices.set(res.data);
          this.onlineCount.set(res.data.filter((d) => d.status === 'ONLINE').length);
          this.lockedCount.set(res.data.filter((d) => d.lockStatus === 'LOCKED').length);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  navigateToDevice(deviceId: string) {
    this.router.navigate(['/devices', deviceId]);
  }

  delayPresets = [
    { key: 'delay.immediately', seconds: 0 },
    { key: 'delay.5min', seconds: 300 },
    { key: 'delay.15min', seconds: 900 },
    { key: 'delay.30min', seconds: 1800 },
    { key: 'delay.1hour', seconds: 3600 },
    { key: 'delay.2hours', seconds: 7200 },
    { key: 'delay.custom', seconds: -1 },
  ];
  selectedPreset = 'delay.5min';
  broadcastDelay = 300;
  customDelayValue = 10;
  timeUnit: 'minutes' | 'hours' = 'minutes';

  // Unlock modal presets
  unlockPresets = [
    { key: 'delay.5min', seconds: 300 },
    { key: 'delay.15min', seconds: 900 },
    { key: 'delay.30min', seconds: 1800 },
    { key: 'delay.1hour', seconds: 3600 },
    { key: 'delay.2hours', seconds: 7200 },
    { key: 'delay.custom', seconds: -1 },
  ];
  selectedUnlockPreset = 'delay.1hour';
  unlockDuration = 3600;
  customUnlockValue = 1;
  unlockTimeUnit: 'minutes' | 'hours' = 'hours';

  selectPreset(preset: { key: string; seconds: number }) {
    this.selectedPreset = preset.key;
    if (preset.seconds >= 0) {
      this.broadcastDelay = preset.seconds;
    } else {
      this.updateCustomDelay();
    }
  }

  updateCustomDelay() {
    const multiplier = this.timeUnit === 'hours' ? 3600 : 60;
    this.broadcastDelay = this.customDelayValue * multiplier;
  }

  selectUnlockPreset(preset: { key: string; seconds: number }) {
    this.selectedUnlockPreset = preset.key;
    if (preset.seconds >= 0) {
      this.unlockDuration = preset.seconds;
    } else {
      this.updateCustomUnlock();
    }
  }

  updateCustomUnlock() {
    const multiplier = this.unlockTimeUnit === 'hours' ? 3600 : 60;
    this.unlockDuration = this.customUnlockValue * multiplier;
  }

  formatDelay(seconds: number): string {
    if (seconds <= 0) return this.i18n.t('delay.execute_immediately');
    if (seconds < 60) return this.i18n.t('delay.seconds', { n: seconds });
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      return this.i18n.t('delay.minute', { n: mins });
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0
      ? this.i18n.t('delay.hour_min', { h: hrs, m: mins })
      : this.i18n.t('delay.hour', { h: hrs });
  }

  broadcastCommand(type: CommandType) {
    const command: CommandRequest = { commandType: type, delaySeconds: this.broadcastDelay };
    this.deviceService.sendCommandToAll(command).subscribe({
      next: () => this.toastService.success(this.i18n.t('broadcast.command_sent', { type })),
      error: (err) => this.toastService.error(err.error?.message || this.i18n.t('broadcast.command_failed')),
    });
  }

  // Quick action methods
  lockDeviceNow(deviceId: string, event: Event) {
    event.stopPropagation();
    const command: CommandRequest = { commandType: 'LOCK', delaySeconds: 0 };
    this.deviceService.sendCommand(deviceId, command).subscribe({
      next: () => {
        this.toastService.success(this.i18n.t('dashboard.lock_now_success'));
        this.loadDevices();
      },
      error: (err) => this.toastService.error(err.error?.message || this.i18n.t('dashboard.action_failed')),
    });
  }

  openUnlockModal(deviceId: string, event: Event) {
    event.stopPropagation();
    this.selectedDeviceId = deviceId;
    this.showUnlockModal.set(true);
  }

  closeUnlockModal() {
    this.showUnlockModal.set(false);
    this.selectedDeviceId = '';
  }

  confirmUnlock() {
    if (!this.selectedDeviceId) return;
    
    this.deviceService.unlockNow(this.selectedDeviceId, this.unlockDuration).subscribe({
      next: () => {
        const timeStr = this.formatDelay(this.unlockDuration);
        this.toastService.success(this.i18n.t('dashboard.unlock_now_success', { time: timeStr }));
        this.closeUnlockModal();
        this.loadDevices();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || this.i18n.t('dashboard.action_failed'));
        this.closeUnlockModal();
      },
    });
  }

  deleteDevice(deviceId: string, event: Event) {
    event.stopPropagation();
    if (!confirm(this.i18n.t('dashboard.delete_confirm'))) {
      return;
    }

    this.deviceService.deleteDevice(deviceId).subscribe({
      next: () => {
        this.toastService.success(this.i18n.t('dashboard.delete_success'));
        this.loadDevices();
      },
      error: (err) => this.toastService.error(err.error?.message || this.i18n.t('dashboard.action_failed')),
    });
  }

  formatTime(datetime: string): string {
    if (!datetime) return 'N/A';
    const d = new Date(datetime);
    return d.toLocaleString(this.i18n.isVi ? 'vi-VN' : 'en-US');
  }
}
