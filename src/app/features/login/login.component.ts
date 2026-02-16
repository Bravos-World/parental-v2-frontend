import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg"></div>

      <!-- Language Toggle -->
      <button class="lang-toggle" (click)="i18n.toggle()">
        {{ i18n.isVi ? '🇻🇳 VI' : '🇬🇧 EN' }}
      </button>

      <div class="login-card glass-card animate-fade-in">
        <div class="login-header">
          <div class="logo-glow">
            <span class="login-logo">🛡️</span>
          </div>
          <h1 class="login-title">Parental<span class="accent">Ctrl</span></h1>
          <p class="login-subtitle">{{ i18n.t('login.subtitle') }}</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          @if (errorMessage()) {
            <div class="error-banner animate-fade-in">
              <span>✕</span>
              {{ errorMessage() }}
            </div>
          }

          <div class="form-group">
            <label class="form-label" for="username">{{ i18n.t('login.username') }}</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                id="username"
                type="text"
                class="input-field input-with-icon"
                [placeholder]="i18n.t('login.username_placeholder')"
                [(ngModel)]="username"
                name="username"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">{{ i18n.t('login.password') }}</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="input-field input-with-icon"
                [placeholder]="i18n.t('login.password_placeholder')"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                (click)="showPassword.set(!showPassword())"
              >
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg login-btn" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span>
              {{ i18n.t('login.signing_in') }}
            } @else {
              {{ i18n.t('login.sign_in') }}
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .login-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 50%),
        var(--bg-primary);
      animation: gradient-shift 15s ease infinite;
      background-size: 200% 200%;
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

    .login-card {
      position: relative;
      width: 100%;
      max-width: 420px;
      padding: 48px 40px;
      margin: 20px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .logo-glow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
      margin-bottom: 16px;
    }

    .login-logo {
      font-size: 2.5rem;
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .accent {
      color: var(--accent-blue);
    }

    .login-subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      font-size: 0.9rem;
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

    .login-btn {
      width: 100%;
      margin-top: 8px;
      position: relative;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  i18n = inject(I18nService);

  username = '';
  password = '';
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage.set(this.i18n.t('login.error_required'));
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || this.i18n.t('login.error_failed'));
      },
    });
  }
}
