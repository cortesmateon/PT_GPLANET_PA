import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  user = signal<User | null>(null);
  loaded = signal(false);

  hasRole(...roles: string[]): boolean {
    const u = this.user();
    return u ? roles.includes(u.rol) : false;
  }

  isAdmin = computed(() => this.user()?.rol === 'admin');

  loadUser(): Observable<User> {
    return this.http.get<User>('/api/me', { withCredentials: true }).pipe(
      tap(u => {
        this.user.set(u);
        this.loaded.set(true);
      })
    );
  }

  logout(): void {
    window.location.href = '/logout';
  }

  initials(): string {
    const n = this.user()?.nombre ?? 'U';
    return n.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  }

  rolLabel(): string {
    // Etiquetas visibles de cada rol. Si agregas un rol nuevo en el backend
    // (database.ROLES), añádelo también acá.
    const map: Record<string, string> = { admin: 'Administrador', usuario: 'Usuario' };
    return map[this.user()?.rol ?? ''] ?? this.user()?.rol ?? '';
  }
}
