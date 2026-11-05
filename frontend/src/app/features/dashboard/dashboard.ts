import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SECCIONES } from '../../secciones.config';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  secciones = computed(() => {
    const u = this.auth.user();
    return SECCIONES.filter(s => !s.roles || (u && s.roles.includes(u.rol)));
  });

  primerNombre(): string {
    return (this.auth.user()?.nombre ?? '').split(' ')[0] || 'bienvenido';
  }

  abrir(path: string) {
    this.router.navigate(['/', path]);
  }
}
