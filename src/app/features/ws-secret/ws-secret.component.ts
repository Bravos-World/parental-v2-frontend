import { Component, inject, signal, OnInit } from '@angular/core';
import { WsSecretService, WebSocketSecretResponse } from '../../core/services/ws-secret.service';
import { ToastService } from '../../shared/services/toast.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-ws-secret',
  standalone: true,
  imports: [],
  template: `
    <div class="ws-secret">
      <div class="page-header">
        <div class="title-row">
          <div class="title-icon">🔑</div>
          <div>
            <h1 class="page-title">{{ i18n.t('wssecret.title') }}</h1>
            <p class="page-desc">{{ i18n.t('wssecret.desc') }}</p>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <span class="info-icon">ℹ️</span>
        <span>{{ i18n.t('wssecret.info') }}</span>
      </div>

      <!-- Secret Card -->
      <div class="secret-card glass-card animate-fade-in">
        <div class="card-header">
          <div class="card-header-left">
            <span class="key-icon">🗝️</span>
            <div>
              <h3 class="card-title">{{ i18n.t('wssecret.card_title') }}</h3>
              <p class="card-sub">{{ i18n.t('wssecret.card_sub') }}</p>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm refresh-btn" (click)="loadSecret()" [disabled]="loading()" id="btn-refresh-secret">
            @if (loading()) {
              <span class="spinner-sm"></span>
            } @else {
              🔄
            }
            {{ i18n.t('wssecret.refresh') }}
          </button>
        </div>

        @if (loading() && !secret()) {
          <div class="loading-state">
            <div class="spinner-lg"></div>
            <p>{{ i18n.t('wssecret.loading') }}</p>
          </div>
        }

        @if (error()) {
          <div class="error-state animate-fade-in">
            <div class="error-icon">⚠️</div>
            <p class="error-msg">{{ error() }}</p>
            <button class="btn btn-primary btn-sm" (click)="loadSecret()" id="btn-retry-secret">
              {{ i18n.t('wssecret.retry') }}
            </button>
          </div>
        }

        @if (secret()) {
          <div class="secret-content animate-fade-in">
            <!-- Secret Key Display -->
            <div class="key-group">
              <label class="key-label">{{ i18n.t('wssecret.secret_key') }}</label>
              <div class="key-display">
                <code class="key-value" [class.key-hidden]="!showKey()">
                  {{ showKey() ? secret()!.secretKey : maskKey(secret()!.secretKey) }}
                </code>
                <div class="key-actions">
                  <button
                    class="icon-btn"
                    (click)="showKey.set(!showKey())"
                    [title]="showKey() ? i18n.t('wssecret.hide') : i18n.t('wssecret.show')"
                    id="btn-toggle-key"
                  >
                    {{ showKey() ? '🙈' : '👁️' }}
                  </button>
                  <button
                    class="icon-btn"
                    (click)="copyKey()"
                    [title]="i18n.t('wssecret.copy')"
                    id="btn-copy-key"
                  >
                    {{ copied() ? '✅' : '📋' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="meta-row">
              <div class="meta-item">
                <span class="meta-label">{{ i18n.t('wssecret.created_at') }}</span>
                <span class="meta-value">{{ formatDate(secret()!.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">{{ i18n.t('wssecret.updated_at') }}</span>
                <span class="meta-value">{{ formatDate(secret()!.updatedAt) }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="actions-grid">
        <!-- Generate -->
        <div class="action-card glass-card-sm">
          <div class="action-icon generate-icon">⚡</div>
          <div class="action-body">
            <h4 class="action-title">{{ i18n.t('wssecret.generate_title') }}</h4>
            <p class="action-desc">{{ i18n.t('wssecret.generate_desc') }}</p>
          </div>
          <button
            class="btn btn-primary action-btn"
            (click)="generate()"
            [disabled]="generating()"
            id="btn-generate-key"
          >
            @if (generating()) {
              <span class="spinner-sm"></span>
              {{ i18n.t('wssecret.generating') }}
            } @else {
              ⚡ {{ i18n.t('wssecret.generate') }}
            }
          </button>
        </div>

        <!-- Renew -->
        <div class="action-card glass-card-sm">
          <div class="action-icon renew-icon">🔄</div>
          <div class="action-body">
            <h4 class="action-title">{{ i18n.t('wssecret.renew_title') }}</h4>
            <p class="action-desc">{{ i18n.t('wssecret.renew_desc') }}</p>
          </div>
          <button
            class="btn btn-warning action-btn"
            (click)="renew()"
            [disabled]="renewing()"
            id="btn-renew-key"
          >
            @if (renewing()) {
              <span class="spinner-sm"></span>
              {{ i18n.t('wssecret.renewing') }}
            } @else {
              🔄 {{ i18n.t('wssecret.renew') }}
            }
          </button>
        </div>
      </div>

      <!-- Usage Guide -->
      <div class="guide-card glass-card-sm animate-fade-in">
        <h4 class="guide-title">📖 {{ i18n.t('wssecret.guide_title') }}</h4>
        <div class="guide-steps">
          <div class="guide-step">
            <span class="step-num">1</span>
            <p class="step-text">{{ i18n.t('wssecret.guide_step1') }}</p>
          </div>
          <div class="guide-step">
            <span class="step-num">2</span>
            <p class="step-text">{{ i18n.t('wssecret.guide_step2') }}</p>
          </div>
          <div class="guide-step">
            <span class="step-num">3</span>
            <p class="step-text">{{ i18n.t('wssecret.guide_step3') }}</p>
          </div>
          <div class="guide-step">
            <span class="step-num">4</span>
            <p class="step-text">{{ i18n.t('wssecret.guide_step4') }}</p>
          </div>
        </div>
        <div class="ws-endpoint">
          <span class="endpoint-label">{{ i18n.t('wssecret.ws_endpoint') }}:</span>
          <code class="endpoint-value">ws://&lt;server&gt;/ws/connect?secret=&lt;key&gt;</code>
        </div>
      </div>
    </div>
  `,
  styles: `
    .ws-secret {
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Page Header ── */
    .page-header {
      margin-bottom: 4px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
      filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.4));
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

    /* ── Info Banner ── */
    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: var(--radius-md);
      color: #93c5fd;
      font-size: 0.875rem;
      line-height: 1.6;
    }

    .info-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* ── Secret Card ── */
    .secret-card {
      padding: 28px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .card-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .key-icon {
      font-size: 1.8rem;
      filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .card-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .refresh-btn {
      flex-shrink: 0;
    }

    /* ── Loading / Error ── */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 0;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 32px 0;
      text-align: center;
    }

    .error-icon {
      font-size: 2.5rem;
    }

    .error-msg {
      color: var(--text-muted);
      font-size: 0.9rem;
      max-width: 360px;
    }

    /* ── Key Display ── */
    .secret-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .key-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .key-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .key-display {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      transition: border-color var(--transition-fast);
      overflow: hidden;
    }

    .key-display:hover {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .key-value {
      flex: 1;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.85rem;
      color: #34d399;
      word-break: break-all;
      transition: filter var(--transition-fast);
      min-width: 0;
    }

    .key-hidden {
      filter: blur(8px);
      user-select: none;
    }

    .key-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }

    .icon-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all var(--transition-fast);
    }

    .icon-btn:hover {
      background: var(--bg-secondary);
      border-color: var(--accent-blue);
    }

    /* ── Meta ── */
    .meta-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 14px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    .meta-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .meta-value {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-family: 'Courier New', Courier, monospace;
    }

    /* ── Actions ── */
    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .action-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .action-icon {
      font-size: 2rem;
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .generate-icon {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .renew-icon {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .action-body {
      flex: 1;
    }

    .action-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .action-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .action-btn {
      width: 100%;
    }

    /* ── Guide ── */
    .guide-card {
      padding: 24px;
    }

    .guide-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .guide-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .guide-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .step-num {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: var(--accent-blue);
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.6;
      padding-top: 2px;
    }

    .ws-endpoint {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: var(--bg-primary);
      border: 1px solid rgba(52, 211, 153, 0.2);
      border-radius: var(--radius-sm);
      flex-wrap: wrap;
      gap: 8px;
    }

    .endpoint-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .endpoint-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.82rem;
      color: #34d399;
      word-break: break-all;
    }

    /* ── Spinners ── */
    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      flex-shrink: 0;
    }

    .spinner-lg {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .page-title {
        font-size: 1.4rem;
      }

      .title-icon {
        font-size: 2rem;
      }

      .secret-card {
        padding: 18px;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
      }

      .refresh-btn {
        width: 100%;
        justify-content: center;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .meta-row {
        grid-template-columns: 1fr;
      }

      .key-value {
        font-size: 0.78rem;
      }
    }

    @media (max-width: 380px) {
      .ws-secret {
        gap: 14px;
      }

      .page-title {
        font-size: 1.2rem;
      }

      .title-icon {
        font-size: 1.7rem;
      }

      .secret-card {
        padding: 14px;
      }

      .guide-card {
        padding: 16px;
      }

      .action-card {
        padding: 16px;
      }
    }
  `,
})
export class WsSecretComponent implements OnInit {
  private wsSecretService = inject(WsSecretService);
  private toastService = inject(ToastService);
  i18n = inject(I18nService);

  secret = signal<WebSocketSecretResponse | null>(null);
  loading = signal(false);
  generating = signal(false);
  renewing = signal(false);
  error = signal('');
  showKey = signal(false);
  copied = signal(false);

  ngOnInit() {
    this.loadSecret();
  }

  loadSecret() {
    this.loading.set(true);
    this.error.set('');

    this.wsSecretService.getSecret().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data) {
          this.secret.set(res.data);
        } else {
          this.error.set(res.message || this.i18n.t('wssecret.no_key'));
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.i18n.t('wssecret.load_failed'));
      },
    });
  }

  generate() {
    this.generating.set(true);
    this.wsSecretService.generateKey().subscribe({
      next: (res) => {
        this.generating.set(false);
        if (res.data) {
          this.secret.set(res.data);
          this.showKey.set(false);
          this.toastService.success(this.i18n.t('wssecret.generated'));
        }
      },
      error: () => {
        this.generating.set(false);
        this.toastService.error(this.i18n.t('wssecret.generate_failed'));
      },
    });
  }

  renew() {
    this.renewing.set(true);
    this.wsSecretService.renewKey().subscribe({
      next: (res) => {
        this.renewing.set(false);
        if (res.data) {
          this.secret.set(res.data);
          this.showKey.set(false);
          this.toastService.success(this.i18n.t('wssecret.renewed'));
        }
      },
      error: () => {
        this.renewing.set(false);
        this.toastService.error(this.i18n.t('wssecret.renew_failed'));
      },
    });
  }

  copyKey() {
    const key = this.secret()?.secretKey;
    if (!key) return;
    navigator.clipboard.writeText(key).then(() => {
      this.copied.set(true);
      this.toastService.success(this.i18n.t('wssecret.copied'));
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  maskKey(key: string): string {
    if (!key) return '';
    return key.slice(0, 6) + '•'.repeat(Math.max(0, key.length - 10)) + key.slice(-4);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString(this.i18n.isVi ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}
