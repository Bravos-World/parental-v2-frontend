import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly STORAGE_KEY = 'pcv2_auth';
  private isLoggedIn$ = new BehaviorSubject<boolean>(this.getInitialAuthStatus());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.checkSession();
  }

  private getInitialAuthStatus(): boolean {
    try {
      return localStorage.getItem(AuthService.STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private checkSession() {
    this.http
      .get<ApiResponse<any>>('/api/devices', { withCredentials: true })
      .pipe(
        map(() => true),
        catchError(() => {
          this.setLocalAuthStatus(false);
          return of(false);
        }),
      )
      .subscribe((isAuth) => {
        this.isLoggedIn$.next(isAuth);
        this.setLocalAuthStatus(isAuth);
      });
  }

  private setLocalAuthStatus(isAuth: boolean) {
    try {
      if (isAuth) {
        localStorage.setItem(AuthService.STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(AuthService.STORAGE_KEY);
      }
    } catch (e) {
      console.error('Local storage error', e);
    }
  }

  login(username: string, password: string) {
    return this.http
      .post<ApiResponse<void>>(
        '/api/auth/login',
        { username, password },
        { withCredentials: true },
      )
      .pipe(
        tap(() => {
          this.isLoggedIn$.next(true);
          this.setLocalAuthStatus(true);
        }),
      );
  }

  logout() {
    return this.http
      .post<ApiResponse<void>>('/api/auth/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.isLoggedIn$.next(false);
          this.setLocalAuthStatus(false);
          this.router.navigate(['/login']);
        }),
      );
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.post<ApiResponse<void>>(
      '/api/auth/change-password',
      { oldPassword, newPassword },
      { withCredentials: true },
    );
  }

  register(username: string, password: string) {
    return this.http.post<ApiResponse<void>>(
      '/api/auth/register',
      { username, password },
      { withCredentials: true },
    );
  }

  get isAuthenticated() {
    return this.isLoggedIn$.asObservable();
  }

  get isLoggedInValue() {
    return this.isLoggedIn$.value;
  }

  setLoggedIn(value: boolean) {
    this.isLoggedIn$.next(value);
    this.setLocalAuthStatus(value);
  }
}
