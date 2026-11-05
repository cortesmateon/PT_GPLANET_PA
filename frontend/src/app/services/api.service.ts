import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

const OPTIONS = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private handleError(err: HttpErrorResponse): Observable<never> {
    if (err.status === 401) {
      window.location.href = '/login';
    }
    return throwError(() => err);
  }

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v != null) httpParams = httpParams.set(k, String(v)); });
    }
    return this.http.get<T>(path, { ...OPTIONS, params: httpParams }).pipe(catchError(e => this.handleError(e)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(path, body, OPTIONS).pipe(catchError(e => this.handleError(e)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(path, body, OPTIONS).pipe(catchError(e => this.handleError(e)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(path, OPTIONS).pipe(catchError(e => this.handleError(e)));
  }

  postForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(path, formData, { withCredentials: true }).pipe(catchError(e => this.handleError(e)));
  }
}
