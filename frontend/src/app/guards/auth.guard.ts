import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.loaded()) {
    if (!auth.user()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
  return auth.loadUser().pipe(
    map(() => true),
    catchError(() => {
      window.location.href = '/login';
      return of(false);
    })
  );
};

export const roleGuard = (...roles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const check = () => {
      if (!auth.user()) { window.location.href = '/login'; return false; }
      if (!auth.hasRole(...roles)) { window.location.href = '/dashboard'; return false; }
      return true;
    };
    if (auth.loaded()) return check();
    return auth.loadUser().pipe(
      map(() => check()),
      catchError(() => { window.location.href = '/login'; return of(false); })
    );
  };
};
