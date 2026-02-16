import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="settings">
      <div class="page-header">
        <h1 class="page-title">{{ i18n.t('settings.title') }}</h1>
        <p class="page-desc">{{ i18n.t('settings.desc') }}</p>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button
          class="tab-btn"
          [class.tab-active]="activeTab() === 'password'"
          (click)="activeTab.set('password')"
          id="tab-change-password"
        >
          <span class="tab-icon">🔐</span>
          <span class="tab-label">{{ i18n.t('settings.tab_password') }}</span>
        </button>
        <button
          class="tab-btn"
          [class.tab-active]="activeTab() === 'create'"
          (click)="activeTab.set('create')"
          id="tab-create-account"
        >
          <span class="tab-icon">👤</span>
          <span class="tab-label">{{ i18n.t('settings.tab_create') }}</span>
        </button>
      </div>

      <!-- Change Password Tab -->
      @if (activeTab() === 'password') {
        <div class="tab-content glass-card-sm animate-fade-in">
          <div class="tab-content-header">
            <h3 class="card-title">{{ i18n.t('settings.change_password_title') }}</h3>
            <p class="card-desc">{{ i18n.t('settings.change_password_desc') }}</p>
          </div>

          <form (ngSubmit)="onChangePassword()" class="settings-form">
            @if (passwordError()) {
              <div class="error-banner animate-fade-in">
                <span class="banner-icon">✕</span> {{ passwordError() }}
              </div>
            }

            <div class="form-group">
              <label class="form-label" for="oldPassword">{{ i18n.t('settings.current_password') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input
                  id="oldPassword"
                  [type]="showOldPassword() ? 'text' : 'password'"
                  class="input-field input-with-icon"
                  [(ngModel)]="oldPassword"
                  name="oldPassword"
                  required
                  [placeholder]="i18n.t('settings.current_password_placeholder')"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showOldPassword.set(!showOldPassword())"
                >
                  {{ showOldPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="newPassword">{{ i18n.t('settings.new_password') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <input
                  id="newPassword"
                  [type]="showNewPassword() ? 'text' : 'password'"
                  class="input-field input-with-icon"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  required
                  [placeholder]="i18n.t('settings.new_password_placeholder')"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showNewPassword.set(!showNewPassword())"
                >
                  {{ showNewPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">{{ i18n.t('settings.confirm_password') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <input
                  id="confirmPassword"
                  [type]="showNewPassword() ? 'text' : 'password'"
                  class="input-field input-with-icon"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  [placeholder]="i18n.t('settings.confirm_password_placeholder')"
                  autocomplete="new-password"
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-submit" [disabled]="passwordLoading()" id="btn-change-password">
              @if (passwordLoading()) {
                <span class="spinner"></span>
                {{ i18n.t('settings.updating') }}
              } @else {
                {{ i18n.t('settings.update_password') }}
              }
            </button>
          </form>
        </div>
      }

      <!-- Create Account Tab -->
      @if (activeTab() === 'create') {
        <div class="tab-content glass-card-sm animate-fade-in">
          <div class="tab-content-header">
            <div class="header-row">
              <div>
                <h3 class="card-title">{{ i18n.t('settings.create_title') }}</h3>
                <p class="card-desc">{{ i18n.t('settings.create_desc') }}</p>
              </div>
              <span class="admin-badge">
                <span class="badge-dot"></span>
                {{ i18n.t('settings.admin_only') }}
              </span>
            </div>
          </div>

          <form (ngSubmit)="onCreateAccount()" class="settings-form">
            @if (createError()) {
              <div class="error-banner animate-fade-in">
                <span class="banner-icon">✕</span> {{ createError() }}
              </div>
            }

            @if (createSuccess()) {
              <div class="success-banner animate-fade-in">
                <span class="banner-icon">✓</span> {{ createSuccess() }}
              </div>
            }

            <div class="form-group">
              <label class="form-label" for="newUsername">{{ i18n.t('login.username') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input
                  id="newUsername"
                  type="text"
                  class="input-field input-with-icon"
                  [(ngModel)]="newUsername"
                  name="newUsername"
                  required
                  [placeholder]="i18n.t('settings.choose_username')"
                  autocomplete="off"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="newAccPassword">{{ i18n.t('login.password') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <input
                  id="newAccPassword"
                  [type]="showCreatePassword() ? 'text' : 'password'"
                  class="input-field input-with-icon"
                  [(ngModel)]="newAccPassword"
                  name="newAccPassword"
                  required
                  [placeholder]="i18n.t('settings.choose_password')"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showCreatePassword.set(!showCreatePassword())"
                >
                  {{ showCreatePassword() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmAccPassword">{{ i18n.t('settings.confirm_password') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <input
                  id="confirmAccPassword"
                  [type]="showCreatePassword() ? 'text' : 'password'"
                  class="input-field input-with-icon"
                  [(ngModel)]="confirmAccPassword"
                  name="confirmAccPassword"
                  required
                  [placeholder]="i18n.t('settings.confirm_acc_password')"
                  autocomplete="new-password"
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-submit" [disabled]="createLoading()" id="btn-create-account">
              @if (createLoading()) {
                <span class="spinner"></span>
                {{ i18n.t('settings.creating') }}
              } @else {
                <span>➕</span>
                {{ i18n.t('settings.create_account') }}
              }
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: `
    .settings {
      max-width: 580px;
    }

    .page-header {
      margin-bottom: 24px;
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

    /* ── Tab Navigation ── */
    .tab-nav {
      display: flex;
      gap: 4px;
      padding: 4px;
      background: var(--bg-glass);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
    }

    .tab-btn:hover {
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
    }

    .tab-active {
      background: var(--bg-tertiary) !important;
      color: var(--accent-blue) !important;
      box-shadow: var(--shadow-sm);
    }

    .tab-icon {
      font-size: 1rem;
    }

    .tab-label {
      white-space: nowrap;
    }

    /* ── Tab Content ── */
    .tab-content {
      padding: 32px;
    }

    .tab-content-header {
      margin-bottom: 24px;
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .card-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 50px;
      color: var(--accent-purple);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-purple);
      animation: pulse-dot 2s ease-in-out infinite;
    }

    /* ── Form ── */
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      pointer-events: none;
    }

    .input-with-icon {
      padding-left: 42px !important;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 4px;
    }

    .btn-submit {
      width: 100%;
      margin-top: 6px;
    }

    /* ── Banners ── */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-sm);
      color: #fca5a5;
      font-size: 0.85rem;
    }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: var(--radius-sm);
      color: #86efac;
      font-size: 0.85rem;
    }

    .banner-icon {
      font-weight: 700;
      flex-shrink: 0;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .settings {
        max-width: 100%;
      }

      .tab-content {
        padding: 20px;
      }

      .tab-btn {
        padding: 10px 12px;
        font-size: 0.8rem;
      }

      .tab-icon {
        font-size: 0.9rem;
      }

      .page-title {
        font-size: 1.4rem;
      }

      .header-row {
        flex-direction: column;
        gap: 8px;
      }
    }

    @media (max-width: 380px) {
      .tab-label {
        display: none;
      }

      .tab-btn {
        justify-content: center;
      }

      .tab-icon {
        font-size: 1.2rem;
      }

      .tab-content {
        padding: 16px;
      }
    }
  `,
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  i18n = inject(I18nService);

  activeTab = signal<'password' | 'create'>('password');

  // Change Password state
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  passwordLoading = signal(false);
  passwordError = signal('');

  // Create Account state
  newUsername = '';
  newAccPassword = '';
  confirmAccPassword = '';
  showCreatePassword = signal(false);
  createLoading = signal(false);
  createError = signal('');
  createSuccess = signal('');

  onChangePassword() {
    this.passwordError.set('');

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError.set(this.i18n.t('settings.error_required'));
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set(this.i18n.t('settings.error_password_mismatch'));
      return;
    }

    if (this.newPassword.length < 4) {
      this.passwordError.set(this.i18n.t('settings.error_password_short'));
      return;
    }

    this.passwordLoading.set(true);

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordLoading.set(false);
        this.toastService.success(this.i18n.t('settings.password_changed'));
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(err.error?.message || this.i18n.t('settings.password_failed'));
      },
    });
  }

  onCreateAccount() {
    this.createError.set('');
    this.createSuccess.set('');

    if (!this.newUsername || !this.newAccPassword || !this.confirmAccPassword) {
      this.createError.set(this.i18n.t('settings.error_required'));
      return;
    }

    if (this.newUsername.length < 3) {
      this.createError.set(this.i18n.t('settings.error_username_short'));
      return;
    }

    if (this.newAccPassword.length < 4) {
      this.createError.set(this.i18n.t('settings.error_password_short'));
      return;
    }

    if (this.newAccPassword !== this.confirmAccPassword) {
      this.createError.set(this.i18n.t('settings.error_password_mismatch'));
      return;
    }

    this.createLoading.set(true);

    this.authService.register(this.newUsername, this.newAccPassword).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.createSuccess.set(this.i18n.t('settings.account_created', { username: this.newUsername }));
        this.toastService.success(this.i18n.t('settings.account_created', { username: this.newUsername }));
        this.newUsername = '';
        this.newAccPassword = '';
        this.confirmAccPassword = '';
      },
      error: (err) => {
        this.createLoading.set(false);
        this.createError.set(err.error?.message || this.i18n.t('settings.create_failed'));
      },
    });
  }
}
