import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'helpdesk_auth_token';
  private readonly USER_KEY = 'helpdesk_auth_user';

  // Signals for reactive auth state
  currentUserSignal = signal<AuthUser | null>(this.getStoredUser());

  isAuthenticated = computed(() => !!this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role?.toLowerCase() === 'admin');
  isEmployee = computed(() => this.currentUserSignal()?.role?.toLowerCase() === 'employee');
  isDeveloper = computed(() => this.currentUserSignal()?.role?.toLowerCase() === 'developer');

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        this.saveSession(res, credentials.email);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(res: LoginResponse, email: string): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const user: AuthUser = {
      fullName: res.fullName,
      email: email,
      role: res.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private getStoredUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}
