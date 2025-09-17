import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Show, ShowsResponse, FilterOptions } from '../models/show.model';

export interface ShowsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  rating?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ShowsService {
  private baseUrl = `${environment.apiUrl}/shows`;

  constructor(private http: HttpClient) { }

  getShows(params?: ShowsQueryParams, authToken?: string): Observable<ShowsResponse> {
    let httpParams = new HttpParams();
    let headers = new HttpHeaders();

    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

  return this.http.get<ShowsResponse>(this.baseUrl, { params: httpParams, headers: headers }).pipe(
    tap(res => console.log("getShows API Response:", res)),
    catchError(this.handleError)
  );
  }

  getShowById(id: string, authToken?: string): Observable<{ show: Show }> {
    let headers = new HttpHeaders();

    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    return this.http.get<{ show: Show }>(`${this.baseUrl}/${id}`, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  getFilterOptions(authToken?: string): Observable<FilterOptions> {
    let headers = new HttpHeaders();

    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    return this.http.get<FilterOptions>(`${this.baseUrl}/filters/options`, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  getShowsStats(authToken?: string): Observable<any> {
    let headers = new HttpHeaders();

    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    return this.http.get(`${this.baseUrl}/stats/overview`, { headers: headers })
      .pipe(catchError(this.handleError));
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