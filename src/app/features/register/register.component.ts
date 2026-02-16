import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-bg"></div>

      <!-- Language Toggle -->
      <button class="lang-toggle" (click)="i18n.toggle()">
        {{ i18n.isVi ? '🇻🇳 VI' : '🇬🇧 EN' }}
      </button>

      <div class="register-card glass-card animate-fade-in">
        <div class="register-header">
          <div class="logo-glow">
            <span class="shield-icon">🛡️</span>
          </div>
          <h1 class="brand">Parental<span class="brand-accent">Ctrl</span></h1>
          <p class="subtitle">{{ i18n.t('register.title') }}</p>
        </div>

        @if (errorMessage()) {
          <div class="error-box animate-fade-in">
            <span>✕</span> {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="success-box animate-fade-in">
            <span>✓</span> {{ successMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label class="form-label" for="username">{{ i18n.t('register.username') }}</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                id="username"
                type="text"
                class="input-field"
                [(ngModel)]="username"
                name="username"
                required
                [placeholder]="i18n.t('register.username_placeholder')"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">{{ i18n.t('register.password') }}</label>
            <div class="input-wrapper">
              <span class="input-icon">🔐</span>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="input-field"
                [(ngModel)]="password"
                name="password"
                required
                [placeholder]="i18n.t('register.password_placeholder')"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="showPassword.set(!showPassword())"
              >
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">{{ i18n.t('register.confirm_password') }}</label>
            <div class="input-wrapper">
              <span class="input-icon">🔐</span>
              <input
                id="confirmPassword"
                [type]="showPassword() ? 'text' : 'password'"
                class="input-field"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                [placeholder]="i18n.t('register.confirm_placeholder')"
                autocomplete="new-password"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span>
              {{ i18n.t('register.creating') }}
            } @else {
              {{ i18n.t('register.submit') }}
            }
          </button>
        </form>

        <p class="login-link">
          {{ i18n.t('register.login_link') }} <a routerLink="/login">{{ i18n.t('register.login_action') }}</a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
    }

    .register-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      animation: gradient-shift 8s ease-in-out infinite alternate;
    }

    .lang-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10;
      padding: 8px 16px;
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      letter-spacing: 0.03em;
    }

    .lang-toggle:hover {
      border-color: var(--accent-blue);
      color: var(--accent-blue);
      background: rgba(59, 130, 246, 0.08);
    }

    .register-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      padding: 40px;
      margin: 20px;
    }

    .register-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .logo-glow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      margin-bottom: 12px;
    }

    .shield-icon {
      font-size: 2.2rem;
    }

    .brand {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .brand-accent {
      color: var(--accent-blue);
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-top: 4px;
    }

    .register-form {
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
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
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

    .input-wrapper .input-field {
      padding-left: 40px;
    }

    .toggle-password {
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

    .btn-full {
      width: 100%;
      margin-top: 6px;
    }

    .error-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-sm);
      color: #fca5a5;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .success-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: var(--radius-sm);
      color: #86efac;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .login-link a {
      color: var(--accent-blue);
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  i18n = inject(I18nService);

  username = '';
  password = '';
  confirmPassword = '';
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  onSubmit() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.username || !this.password || !this.confirmPassword) {
      this.errorMessage.set(this.i18n.t('register.error_required'));
      return;
    }

    if (this.username.length < 3) {
      this.errorMessage.set(this.i18n.t('register.error_username_short'));
      return;
    }

    if (this.password.length < 4) {
      this.errorMessage.set(this.i18n.t('register.error_password_short'));
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set(this.i18n.t('register.error_password_mismatch'));
      return;
    }

    this.loading.set(true);

    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set(this.i18n.t('register.success'));
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || this.i18n.t('register.error_failed'));
      },
    });
  }
}
