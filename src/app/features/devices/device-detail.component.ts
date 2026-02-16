import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../core/services/device.service';
import { Device, DeviceEvent, CommandType, CommandRequest } from '../../core/models/device.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../shared/services/toast.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent],
  template: `
    <div class="device-detail">
      <!-- Back nav -->
      <button class="back-btn" (click)="goBack()">{{ i18n.t('device.back') }}</button>

      @if (loading()) {
        <div class="loading-state">
          <span class="spinner-lg"></span>
          <p>{{ i18n.t('device.loading') }}</p>
        </div>
      } @else if (device()) {
        <!-- Device Header -->
        <div class="device-header glass-card-sm animate-fade-in">
          <div class="device-header-info">
            <h1 class="device-title">{{ device()!.deviceName }}</h1>
            <p class="device-id">{{ device()!.deviceId }}</p>
          </div>
          <div class="device-header-badges">
            <app-status-badge
              [variant]="device()!.status === 'ONLINE' ? 'online' : 'offline'"
              [label]="device()!.status"
            />
            <app-status-badge
              [variant]="device()!.lockStatus === 'LOCKED' ? 'locked' : 'unlocked'"
              [label]="device()!.lockStatus"
            />
          </div>
        </div>

        <!-- Device info grid -->
        <div class="info-grid">
          <div class="info-card glass-card-sm">
            <span class="info-icon">🌐</span>
            <span class="info-label">{{ i18n.t('device.ip_address') }}</span>
            <span class="info-value">{{ device()!.ipAddress }}</span>
          </div>
          <div class="info-card glass-card-sm">
            <span class="info-icon">📅</span>
            <span class="info-label">{{ i18n.t('device.created') }}</span>
            <span class="info-value">{{ formatTime(device()!.createdAt) }}</span>
          </div>
          <div class="info-card glass-card-sm">
            <span class="info-icon">👁️</span>
            <span class="info-label">{{ i18n.t('device.last_seen') }}</span>
            <span class="info-value">{{ formatTime(device()!.lastSeen) }}</span>
          </div>
        </div>

        <div class="panels-grid">
          <!-- Command Panel -->
          <div class="panel glass-card-sm">
            <h3 class="panel-title">{{ i18n.t('device.commands_title') }}</h3>
            <div class="delay-section">
              <label class="form-label-sm">{{ i18n.t('device.delay') }}</label>
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
              <p class="delay-hint">⏱️ {{ formatDelay(delaySeconds) }}</p>
            </div>
            <div class="command-buttons">
              <button class="btn btn-danger" (click)="sendCommand('LOCK')" [disabled]="device()!.status !== 'ONLINE'">
                🔒 {{ i18n.t('device.lock') }}
              </button>
              <button class="btn btn-success" (click)="sendCommand('UNLOCK')" [disabled]="device()!.status !== 'ONLINE'">
                🔓 {{ i18n.t('device.unlock') }}
              </button>
              <button class="btn btn-warning" (click)="sendCommand('SHUTDOWN')" [disabled]="device()!.status !== 'ONLINE'">
                ⏻ {{ i18n.t('device.shutdown') }}
              </button>
              <button class="btn btn-ghost" (click)="sendCommand('RESTART')" [disabled]="device()!.status !== 'ONLINE'">
                🔄 {{ i18n.t('device.restart') }}
              </button>
            </div>
            @if (device()!.status !== 'ONLINE') {
              <p class="offline-hint">{{ i18n.t('device.offline_hint') }}</p>
            }
          </div>

          <!-- Message Panel -->
          <div class="panel glass-card-sm">
            <h3 class="panel-title">{{ i18n.t('device.message_title') }}</h3>
            <textarea
              class="input-field message-area"
              [(ngModel)]="messageText"
              rows="4"
              [placeholder]="i18n.t('device.message_placeholder')"
            ></textarea>
            <button
              class="btn btn-primary"
              (click)="sendMessage()"
              [disabled]="!messageText.trim() || device()!.status !== 'ONLINE'"
            >
              ✉️ {{ i18n.t('device.send_message') }}
            </button>
          </div>
        </div>

        <!-- Event History -->
        <div class="events-section glass-card-sm">
          <div class="events-header">
            <h3 class="panel-title">{{ i18n.t('device.events_title') }}</h3>
            <button class="btn btn-ghost btn-sm" (click)="loadEvents()">🔄 {{ i18n.t('device.refresh') }}</button>
          </div>

          @if (events().length === 0) {
            <p class="no-events">{{ i18n.t('device.no_events') }}</p>
          } @else {
            <div class="events-table-wrapper">
              <table class="events-table">
                <thead>
                  <tr>
                    <th>{{ i18n.t('device.type') }}</th>
                    <th>{{ i18n.t('device.description') }}</th>
                    <th>{{ i18n.t('device.time') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (event of events(); track event.id) {
                    <tr>
                      <td>
                        <span class="event-type-badge" [class]="'event-' + event.eventType.toLowerCase()">
                          {{ event.eventType }}
                        </span>
                      </td>
                      <td class="event-desc">{{ event.description }}</td>
                      <td class="event-time">{{ formatTime(event.timestamp) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="pagination">
              <button class="btn btn-ghost btn-sm" (click)="prevPage()" [disabled]="eventPage() === 0">
                {{ i18n.t('device.prev') }}
              </button>
              <span class="page-info">{{ i18n.t('device.page_info', { current: eventPage() + 1, total: totalPages() }) }}</span>
              <button class="btn btn-ghost btn-sm" (click)="nextPage()" [disabled]="eventPage() >= totalPages() - 1">
                {{ i18n.t('device.next') }}
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .device-detail {
      max-width: 1000px;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--accent-blue);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 20px;
      padding: 0;
      transition: color var(--transition-fast);
    }

    .back-btn:hover {
      color: var(--accent-blue-hover);
    }

    /* Header */
    .device-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      margin-bottom: 20px;
    }

    .device-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .device-id {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: monospace;
    }

    .device-header-badges {
      display: flex;
      gap: 8px;
    }

    /* Info grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .info-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 18px;
      transition: transform var(--transition-fast);
    }

    .info-card:hover {
      transform: translateY(-2px);
    }

    .info-icon {
      font-size: 1.3rem;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-value {
      font-size: 0.95rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Panels grid */
    .panels-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .panel {
      padding: 24px;
    }

    .panel-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .delay-section {
      margin-bottom: 16px;
    }

    .form-label-sm {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .delay-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
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
    }

    .time-unit-select {
      width: 120px;
      cursor: pointer;
    }

    .delay-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 6px;
    }

    .command-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .offline-hint {
      margin-top: 14px;
      font-size: 0.8rem;
      color: var(--accent-amber);
    }

    .message-area {
      resize: vertical;
      min-height: 100px;
      margin-bottom: 12px;
    }

    /* Events */
    .events-section {
      padding: 24px;
    }

    .events-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .no-events {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
      padding: 32px 0;
    }

    .events-table-wrapper {
      overflow-x: auto;
    }

    .events-table {
      width: 100%;
      border-collapse: collapse;
    }

    .events-table th {
      text-align: left;
      padding: 10px 14px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }

    .events-table td {
      padding: 12px 14px;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-color);
    }

    .events-table tbody tr {
      transition: background var(--transition-fast);
    }

    .events-table tbody tr:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .event-type-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .event-lock { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .event-unlock { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
    .event-shutdown { background: rgba(245, 158, 11, 0.15); color: #fcd34d; }
    .event-restart { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; }
    .event-connect { background: rgba(34, 197, 94, 0.15); color: #86efac; }
    .event-disconnect { background: rgba(100, 116, 139, 0.15); color: #94a3b8; }

    .event-desc { color: var(--text-secondary); }
    .event-time { color: var(--text-muted); white-space: nowrap; }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }

    .page-info {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Loading */
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .device-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .panels-grid {
        grid-template-columns: 1fr;
      }

      .command-buttons {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class DeviceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);
  i18n = inject(I18nService);

  device = signal<Device | null>(null);
  loading = signal(true);
  events = signal<DeviceEvent[]>([]);
  eventPage = signal(0);
  totalPages = signal(1);

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
  delaySeconds = 300;
  customDelayValue = 10;
  timeUnit: 'minutes' | 'hours' = 'minutes';
  messageText = '';

  selectPreset(preset: { key: string; seconds: number }) {
    this.selectedPreset = preset.key;
    if (preset.seconds >= 0) {
      this.delaySeconds = preset.seconds;
    } else {
      this.updateCustomDelay();
    }
  }

  updateCustomDelay() {
    const multiplier = this.timeUnit === 'hours' ? 3600 : 60;
    this.delaySeconds = this.customDelayValue * multiplier;
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

  ngOnInit() {
    const deviceId = this.route.snapshot.paramMap.get('id')!;
    this.loadDevice(deviceId);
    this.loadEvents();
  }

  loadDevice(deviceId: string) {
    this.deviceService.getDevice(deviceId).subscribe({
      next: (res) => {
        this.device.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error(this.i18n.t('device.load_failed'));
      },
    });
  }

  loadEvents() {
    const deviceId = this.route.snapshot.paramMap.get('id')!;
    this.deviceService.getEvents(deviceId, this.eventPage(), 20).subscribe({
      next: (res) => {
        if (res.data) {
          this.events.set(res.data.content);
          this.totalPages.set(res.data.totalPages || 1);
        }
      },
    });
  }

  sendCommand(type: CommandType) {
    const deviceId = this.device()!.deviceId;
    const command: CommandRequest = { commandType: type, delaySeconds: this.delaySeconds };
    this.deviceService.sendCommand(deviceId, command).subscribe({
      next: () => {
        this.toastService.success(this.i18n.t('device.command_sent', { type }));
        this.loadDevice(deviceId);
      },
      error: (err) => this.toastService.error(err.error?.message || this.i18n.t('device.command_failed')),
    });
  }

  sendMessage() {
    const deviceId = this.device()!.deviceId;
    this.deviceService.sendMessage(deviceId, { message: this.messageText }).subscribe({
      next: () => {
        this.toastService.success(this.i18n.t('device.message_sent'));
        this.messageText = '';
      },
      error: (err) => this.toastService.error(err.error?.message || this.i18n.t('device.message_failed')),
    });
  }

  prevPage() {
    if (this.eventPage() > 0) {
      this.eventPage.set(this.eventPage() - 1);
      this.loadEvents();
    }
  }

  nextPage() {
    if (this.eventPage() < this.totalPages() - 1) {
      this.eventPage.set(this.eventPage() + 1);
      this.loadEvents();
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatTime(datetime: string): string {
    if (!datetime) return 'N/A';
    return new Date(datetime).toLocaleString(this.i18n.isVi ? 'vi-VN' : 'en-US');
  }
}
