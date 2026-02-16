import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar-collapsed]="collapsed()" [class.sidebar-mobile-open]="mobileOpen()">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🛡️</span>
            @if (!collapsed()) {
              <span class="logo-text">Parental<span class="logo-accent">Ctrl</span></span>
            }
          </div>
          <button type="button" class="toggle-btn" (click)="collapsed.set(!collapsed())" aria-label="Toggle sidebar">
            {{ collapsed() ? '→' : '←' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-item">
            <span class="nav-icon">📊</span>
            @if (!collapsed()) { <span class="nav-label">{{ i18n.t('nav.dashboard') }}</span> }
          </a>
          <a routerLink="/settings" routerLinkActive="nav-active" class="nav-item">
            <span class="nav-icon">⚙️</span>
            @if (!collapsed()) { <span class="nav-label">{{ i18n.t('nav.settings') }}</span> }
          </a>
        </nav>

        <div class="sidebar-footer">
          <!-- Language Toggle -->
          <button class="nav-item lang-btn" (click)="i18n.toggle()">
            <span class="nav-icon">{{ i18n.isVi ? '🇻🇳' : '🇬🇧' }}</span>
            @if (!collapsed()) {
              <span class="nav-label">{{ i18n.isVi ? 'Tiếng Việt' : 'English' }}</span>
            }
          </button>
          <button class="nav-item logout-btn" (click)="onLogout()">
            <span class="nav-icon">🚪</span>
            @if (!collapsed()) { <span class="nav-label">{{ i18n.t('nav.logout') }}</span> }
          </button>
        </div>
      </aside>

      <!-- Mobile overlay -->
      @if (mobileOpen()) {
        <div class="mobile-overlay" (click)="mobileOpen.set(false)"></div>
      }

      <!-- Main content  -->
      <main class="main-content" [class.main-expanded]="collapsed()">
        <header class="topbar">
          <button class="mobile-toggle" (click)="mobileOpen.set(!mobileOpen())">☰</button>
          <div class="topbar-spacer"></div>
          <div class="topbar-actions">
            <button class="lang-switch" (click)="i18n.toggle()" [title]="i18n.isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'">
              <span class="lang-flag">{{ i18n.isVi ? '🇻🇳' : '🇬🇧' }}</span>
              <span class="lang-label">{{ i18n.isVi ? 'VI' : 'EN' }}</span>
            </button>
            <span class="user-badge">
              <span class="user-avatar">👤</span>
              {{ i18n.t('nav.admin') }}
            </span>
          </div>
        </header>
        <div class="page-content animate-fade-in">
          <router-outlet />
        </div>
      </main>
    </div>

    <app-toast />
  `,
  styles: `
    .layout {
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(15, 23, 42, 0.98) 100%);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
    }

    .sidebar-collapsed {
      width: 72px;
    }

    .sidebar-collapsed .sidebar-header {
      flex-direction: column;
      gap: 16px;
      justify-content: center;
      padding: 20px 0;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .logo-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .logo-accent {
      color: var(--accent-blue);
    }

    .toggle-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      width: 28px;
      height: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
      transition: all var(--transition-fast);
    }

    .toggle-btn:hover {
      background: var(--accent-blue);
      color: white;
      border-color: var(--accent-blue);
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }

    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .nav-active {
      background: rgba(59, 130, 246, 0.12) !important;
      color: var(--accent-blue) !important;
      border-left: 3px solid var(--accent-blue);
    }

    .nav-icon {
      font-size: 1.15rem;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-footer {
      padding: 12px 8px;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lang-btn:hover {
      background: rgba(59, 130, 246, 0.08) !important;
      color: var(--accent-blue) !important;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      color: var(--accent-red) !important;
    }

    /* ── Main Content ── */
    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left var(--transition-normal);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-expanded {
      margin-left: 72px;
    }

    .topbar {
      display: flex;
      align-items: center;
      padding: 12px 28px;
      border-bottom: 1px solid var(--border-color);
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .topbar-spacer {
      flex: 1;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .lang-switch {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 50px;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .lang-switch:hover {
      border-color: var(--accent-blue);
      color: var(--accent-blue);
      background: rgba(59, 130, 246, 0.08);
    }

    .lang-flag {
      font-size: 1rem;
    }

    .lang-label {
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .user-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .user-avatar {
      font-size: 0.9rem;
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 1.3rem;
      cursor: pointer;
      padding: 4px;
    }

    .mobile-overlay {
      display: none;
    }

    .page-content {
      padding: 28px;
      flex: 1;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .toggle-btn {
        display: none;
      }

      .sidebar {
        transform: translateX(-100%);
        width: 260px !important;
      }

      .sidebar-mobile-open {
        transform: translateX(0) !important;
      }

      .sidebar-collapsed {
        transform: translateX(-100%);
      }

      .main-content {
        margin-left: 0 !important;
      }

      .mobile-toggle {
        display: block;
      }

      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 90;
        animation: fadeIn var(--transition-fast) ease forwards;
      }

      .page-content {
        padding: 16px;
      }

      .topbar {
        padding: 12px 16px;
      }

      .lang-label {
        display: none;
      }
    }
  `,
})
export class LayoutComponent {
  private authService = inject(AuthService);
  i18n = inject(I18nService);
  collapsed = signal(false);
  mobileOpen = signal(false);

  onLogout() {
    this.authService.logout().subscribe();
  }
}
