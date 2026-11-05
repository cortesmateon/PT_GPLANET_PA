import { Component, HostListener, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ApiService } from '../services/api.service';
import { Notificacion } from '../models/types';
import { SECCIONES } from '../secciones.config';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './shell.html'
})
export class ShellComponent implements OnDestroy {
  auth = inject(AuthService);
  notifications = inject(NotificationService);
  private api = inject(ApiService);

  collapsed = false;
  notifOpen = signal(false);
  items = signal<Notificacion[]>([]);
  private pollInterval: any;
  private pollSetup = false;

  secciones = computed(() => {
    const u = this.auth.user();
    return SECCIONES.filter(s => !s.roles || (u && s.roles.includes(u.rol)));
  });

  constructor() {
    try {
      if (localStorage.getItem('prueba-gplanet_sidebar_collapsed') === '1') {
        this.collapsed = true;
        document.body.classList.add('sidebar-collapsed');
      }
    } catch {}

    effect(() => {
      if (this.auth.user() && !this.pollSetup) {
        this.pollSetup = true;
        this.api.get<{ poll_intervalo: number }>('/api/notificaciones/settings').subscribe({
          next: s => {
            this.cargarNotificaciones();
            const ms = Math.max(10, s.poll_intervalo || 60) * 1000;
            this.pollInterval = setInterval(() => this.cargarNotificaciones(), ms);
          },
          error: () => {
            this.cargarNotificaciones();
            this.pollInterval = setInterval(() => this.cargarNotificaciones(), 60000);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  cargarNotificaciones() {
    this.api.get<{ items: Notificacion[] }>('/api/notificaciones').subscribe({
      next: r => this.items.set(r.items),
      error: () => {}
    });
  }

  toggleNotif() { this.notifOpen.update(v => !v); }
  closeNotif() { this.notifOpen.set(false); }

  marcarLeida(item: Notificacion) {
    this.api.put(`/api/notificaciones/${item.id}/leer`, {}).subscribe({
      next: () => this.items.update(list => list.filter(i => i.id !== item.id)),
      error: () => {}
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.closeNotif(); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) this.closeNotif();
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    document.body.classList.toggle('sidebar-collapsed', this.collapsed);
    try { localStorage.setItem('prueba-gplanet_sidebar_collapsed', this.collapsed ? '1' : '0'); } catch {}
  }
}
