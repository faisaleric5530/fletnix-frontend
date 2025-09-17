import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('fletnix_token');
    const user = localStorage.getItem('fletnix_user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        this.clearStoredAuth();
      }
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  getProfile(): Observable<{user: User}> {
    return this.http.get<{user: User}>(`${this.baseUrl}/profile`)
      .pipe(
        tap(response => this.currentUserSubject.next(response.user)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.clearStoredAuth();
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('fletnix_token', response.token);
    localStorage.setItem('fletnix_user', JSON.stringify(response.user));
    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('fletnix_token');
    localStorage.removeItem('fletnix_user');
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || error.error?.message || error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}