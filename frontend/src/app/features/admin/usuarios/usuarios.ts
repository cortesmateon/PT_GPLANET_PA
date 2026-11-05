import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PaginatorComponent } from '../../shared/paginator/paginator';
import { Usuario } from '../../../models/types';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, PaginatorComponent],
  templateUrl: './usuarios.html'
})
export class UsuariosComponent implements OnInit {
  private api = inject(ApiService);
  private notifications = inject(NotificationService);
  auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  roles = signal<Record<string, string>>({ admin: 'Administrador', usuario: 'Usuario' });
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  nuevoUsuario = signal<{ nombre: string; email: string; rol: string }>({ nombre: '', email: '', rol: 'usuario' });
  confirmToggle = signal<Usuario | null>(null);

  buscar = signal('');
  page = signal(1);
  pageSize = signal(Number(localStorage.getItem('prueba-gplanet_usuarios_pageSize')) || 25);

  formValido = computed(() => {
    const { nombre, email } = this.nuevoUsuario();
    return !!nombre.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  });

  rolesList = computed(() => Object.entries(this.roles()).map(([value, label]) => ({ value, label })));

  filtrados = computed(() => {
    const q = this.buscar().trim().toLowerCase();
    if (!q) return this.usuarios();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  paginated = computed(() => {
    const s = (this.page() - 1) * this.pageSize();
    return this.filtrados().slice(s, s + this.pageSize());
  });

  setBuscar(v: string) { this.buscar.set(v); this.page.set(1); }

  setPageSize(ps: number) {
    localStorage.setItem('prueba-gplanet_usuarios_pageSize', String(ps));
    this.pageSize.set(ps);
    this.page.set(1);
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.get<{ usuarios: Usuario[]; roles: Record<string, string> }>('/api/usuarios').subscribe({
      next: r => {
        this.usuarios.set(r.usuarios);
        if (r.roles) this.roles.set(r.roles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  esSelf(u: Usuario): boolean {
    return u.email === this.auth.user()?.email;
  }

  cambiarRol(u: Usuario, rol: string) {
    if (this.esSelf(u)) return;
    this.api.put(`/api/usuarios/${u.id}/rol`, { rol }).subscribe({
      next: () => { this.load(); this.notifications.show('Rol actualizado', 'success'); },
      error: (e: any) => this.notifications.show(e?.error?.error || 'Error al actualizar', 'error')
    });
  }

  pedirToggle(u: Usuario) {
    if (this.esSelf(u)) return;
    this.confirmToggle.set(u);
  }

  cancelarToggle() { this.confirmToggle.set(null); }

  confirmarToggle() {
    const u = this.confirmToggle(); if (!u) return;
    this.api.put(`/api/usuarios/${u.id}/toggle`, {}).subscribe({
      next: () => { this.confirmToggle.set(null); this.load(); this.notifications.show('Estado actualizado', 'success'); },
      error: (e: any) => this.notifications.show(e?.error?.error || 'Error al actualizar', 'error')
    });
  }

  openModal() { this.showModal.set(true); }
  closeModal() { this.showModal.set(false); this.nuevoUsuario.set({ nombre: '', email: '', rol: 'usuario' }); }

  agregar() {
    if (!this.formValido()) { this.notifications.show('Ingresa un nombre y un correo válido', 'error'); return; }
    const { nombre, email, rol } = this.nuevoUsuario();
    this.saving.set(true);
    this.api.post('/api/usuarios', { email: email.trim(), nombre: nombre.trim(), rol }).subscribe({
      next: () => { this.closeModal(); this.load(); this.notifications.show('Usuario agregado', 'success'); this.saving.set(false); },
      error: (e: any) => { this.notifications.show(e?.error?.error || 'Error al agregar', 'error'); this.saving.set(false); }
    });
  }
}
